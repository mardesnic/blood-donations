// End-to-end smoke test against a running app with a seeded database (admin
// user plus faker data, no donor CSV). Logs in, then runs list, filter, sort,
// export and create/update/delete cycles for donors, actions and donations.
//
//   node scripts/smoke-test.mjs [baseUrl]   (default http://localhost:3000)
//
// Never point this at production: it creates and deletes records.

const BASE = process.argv[2] || 'http://localhost:3000';
const ADMIN = { email: 'admin@admin.admin', password: 'AdminPassword123' };
const cookies = new Map();
let failures = 0;

function storeCookies(res) {
  for (const header of res.headers.getSetCookie()) {
    const [pair] = header.split(';');
    const index = pair.indexOf('=');
    cookies.set(pair.slice(0, index), pair.slice(index + 1));
  }
}

async function call(method, path, { body, form, raw, redirect } = {}) {
  const headers = {
    cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
  };
  let payload;
  if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (form !== undefined) {
    headers['content-type'] = 'application/x-www-form-urlencoded';
    payload = new URLSearchParams(form).toString();
  }
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: payload,
    redirect: redirect || 'follow',
  });
  storeCookies(res);
  const text = await res.text();
  if (raw) return { status: res.status, data: text };
  try {
    return { status: res.status, data: text ? JSON.parse(text) : null };
  } catch {
    return { status: res.status, data: text };
  }
}

function check(name, ok, detail) {
  if (!ok) failures += 1;
  const suffix =
    !ok && detail !== undefined ? `  -- ${JSON.stringify(detail)}` : '';
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${suffix}`);
}

const query = (params) => new URLSearchParams(params).toString();

async function main() {
  let res = await call('GET', '/api/donors', { redirect: 'manual' });
  check(
    'anonymous API request is refused',
    [307, 401].includes(res.status),
    res.status
  );

  const { data: csrf } = await call('GET', '/api/auth/csrf');
  await call('POST', '/api/auth/callback/credentials', {
    form: { csrfToken: csrf.csrfToken, ...ADMIN, json: 'true' },
    redirect: 'manual',
  });
  const { data: session } = await call('GET', '/api/auth/session');
  check('login with seeded admin', Boolean(session?.user), session);

  // Donors: list, sort, paging, filters, search
  res = await call(
    'GET',
    `/api/donors?${query({ pageSize: 5, sort: 'fullName|asc' })}`
  );
  const total = res.data?.count ?? 0;
  check(
    'donors list',
    res.status === 200 &&
      res.data.donors.length === Math.min(5, total) &&
      total > 0,
    res.status
  );
  const names = res.data.donors.map((d) => d.fullName);
  check(
    'donors sorted by name',
    names.join() === [...names].sort((a, b) => (a < b ? -1 : 1)).join(),
    names
  );
  res = await call('GET', `/api/donors?${query({ page: 1, pageSize: 5 })}`);
  check(
    'donors page 2',
    res.status === 200 &&
      res.data.donors.length === Math.max(0, Math.min(5, total - 5))
  );
  res = await call('GET', '/api/donors?pageSize=100000');
  check(
    'page size capped at 100',
    res.status === 200 && res.data.donors.length === Math.min(total, 100)
  );
  res = await call('GET', `/api/donors?${query({ sort: 'password|asc' })}`);
  check('unknown sort field falls back', res.status === 200, res.status);

  // A donor with a blood type and city to filter by (not every donor has
  // them, so look through the pages).
  let first;
  for (let page = 0; !first; page++) {
    const { donors } = (
      await call('GET', `/api/donors?${query({ page, pageSize: 100 })}`)
    ).data;
    if (!donors.length) {
      throw new Error('No donor with a blood type and city to filter by.');
    }
    first = donors.find((d) => d.bloodType && d.city);
  }
  res = await call(
    'GET',
    `/api/donors?${query({ filter: `bloodType|isAnyOf|${first.bloodType}` })}`
  );
  check(
    'blood type filter',
    res.status === 200 &&
      res.data.count >= 1 &&
      res.data.donors.every((d) => d.bloodType === first.bloodType)
  );
  res = await call(
    'GET',
    `/api/donors?${query({ filter: `city|equals|${first.city}` })}`
  );
  check('city filter', res.status === 200 && res.data.count >= 1);
  res = await call('GET', `/api/donors?${query({ search: first.lastName })}`);
  check('search by last name', res.status === 200 && res.data.count >= 1);

  res = await call('GET', '/api/donors/export', { raw: true });
  const rows = res.data.trim().split('\n');
  check(
    'CSV export',
    res.status === 200 &&
      rows[0].startsWith('Name,') &&
      rows.length === total + 1,
    rows.length
  );

  // Donor create / update
  const donorBody = {
    firstName: 'Smoke',
    lastName: 'Test',
    email: 'smoke@example.com',
    gender: 'FEMALE',
    bloodType: 'O_NEGATIVE',
    oib: '12345678903',
    dob: '1990-05-01',
    initialDonationCount: 5,
    initialLastDonation: '2025-01-10',
  };
  const DAY = (value) => `${value}T00:00:00.000Z`;
  const findDonor = async (oib) =>
    (await call('GET', `/api/donors?${query({ search: oib })}`)).data.donors[0];
  res = await call('POST', '/api/donors', { body: donorBody });
  const donor = res.data;
  check('create donor', res.status === 200 && Boolean(donor?.id), res.data);
  res = await call('PUT', `/api/donors/${donor.id}`, {
    body: { ...donorBody, city: 'Split' },
  });
  check(
    'update donor',
    res.status === 200 && res.data.city === 'Split',
    res.data
  );
  check(
    'starting values become the totals',
    res.data.donationCount === 5 && res.data.lastDonation === DAY('2025-01-10'),
    res.data
  );
  check(
    'date of birth keeps its day',
    res.data.dob === DAY('1990-05-01'),
    res.data.dob
  );

  // A donor with only the required fields, a multi-word name, made inactive
  res = await call('POST', '/api/donors', {
    body: {
      firstName: 'Ana Marija',
      lastName: 'Horvat Kovač',
      gender: 'MALE',
      oib: '98765432109',
    },
  });
  const minimal = res.data;
  check(
    'create donor without birth date, blood type or OIB',
    res.status === 200 &&
      minimal.fullName === 'Ana Marija Horvat Kovač' &&
      minimal.dob === null &&
      minimal.bloodType === null &&
      minimal.lastDonation === null,
    res.data
  );
  res = await call('PUT', `/api/donors/${minimal.id}`, {
    body: {
      firstName: 'Ana Marija',
      lastName: 'Horvat Kovač',
      gender: 'MALE',
      oib: '98765432109',
      active: false,
    },
  });
  check(
    'make donor inactive',
    res.status === 200 && res.data.active === false,
    res.data
  );
  res = await call('POST', '/api/donors', {
    body: { firstName: 'No', gender: 'MALE' },
  });
  check('donor without last name rejected', res.status === 400, res.status);

  // Filters that used to be ignored
  const count = async (filters) =>
    (
      await call(
        'GET',
        `/api/donors?${new URLSearchParams(filters.map((f) => ['filter', f]))}`
      )
    ).data.count;
  const everyone = await count([]);
  const [males, females] = [
    await count(['gender|is|MALE']),
    await count(['gender|is|FEMALE']),
  ];
  check(
    'gender filter splits all donors',
    males > 0 && females > 0 && males + females === everyone,
    { males, females, everyone }
  );
  const [active, inactive] = [
    await count(['active|is|ACTIVE']),
    await count(['active|is|INACTIVE']),
  ];
  check(
    'status filter finds the inactive donor',
    inactive >= 1 && active + inactive === everyone,
    { active, inactive }
  );
  check(
    'date filter matches the whole day',
    (await count([`dob|is|${DAY('1990-05-01')}`])) >= 1
  );
  res = await call(
    'GET',
    `/api/donors/export?${new URLSearchParams([
      ['filter', 'gender|is|FEMALE'],
      ['filter', 'active|is|ACTIVE'],
    ])}`,
    { raw: true }
  );
  check(
    'export applies every filter',
    res.data.trim().split('\n').length ===
      (await count(['gender|is|FEMALE', 'active|is|ACTIVE'])) + 1
  );
  check('export has no "Invalid Date"', !res.data.includes('Invalid Date'));
  check(
    'export has a Next Eligible column',
    res.data.split('\n')[0].includes('Next Eligible')
  );
  res = await call('DELETE', `/api/donors/${minimal.id}`);
  check('delete minimal donor', res.status === 200, res.status);

  // Action without a place
  const actionBody = {
    title: 'Smoke action',
    placeId: '',
    startDateTime: '2026-10-01T08:00:00.000Z',
    endDateTime: '2026-10-01T14:00:00.000Z',
  };
  res = await call('POST', '/api/actions', { body: actionBody });
  const action = res.data;
  check(
    'create action without place',
    res.status === 200 && action?.placeId === null,
    res.data
  );
  res = await call('PUT', `/api/actions/${action.id}`, {
    body: { ...actionBody, note: 'edited' },
  });
  check(
    'update action',
    res.status === 200 && res.data.note === 'edited',
    res.data
  );
  res = await call(
    'GET',
    `/api/actions?${query({ sort: 'startDateTime|desc' })}`
  );
  check('actions list', res.status === 200 && res.data.count >= 1);

  // Donation without an action, then moved to the action and denied
  const donationBody = {
    donorId: donor.id,
    actionId: '',
    denied: false,
    denyReason: null,
    donationDate: '2026-10-01T09:00:00.000Z',
    note: '',
  };
  res = await call('POST', '/api/donations', { body: donationBody });
  const donation = res.data;
  check(
    'create donation without action',
    res.status === 200 && donation?.actionId === null,
    res.data
  );
  let stats = await findDonor(donorBody.oib);
  check(
    'recorded donation is added to the totals',
    stats.donationCount === 6 && stats.lastDonation === DAY('2026-10-01'),
    stats
  );
  // Women wait 4 months after a donation (2026-10-01 -> 2027-02-01). Whether
  // that is past depends on today, so compare with the eligible filter.
  const eligibleNow = async () =>
    (
      await call(
        'GET',
        `/api/donors?${query({ search: donorBody.oib, filter: 'eligible|is|NOW' })}`
      )
    ).data.count === 1;
  check(
    'next eligible date follows the 4-month gap',
    stats.eligibility?.nextEligible === DAY('2027-02-01') &&
      (stats.eligibility.status === 'ELIGIBLE') === (await eligibleNow()),
    stats.eligibility
  );

  res = await call('PUT', `/api/donations/${donation.id}`, {
    body: {
      ...donationBody,
      actionId: action.id,
      denied: true,
      denyReason: 'ONE_MONTH',
    },
  });
  check(
    'update donation (action, denied)',
    res.status === 200 &&
      res.data.actionId === action.id &&
      res.data.denyReason === 'ONE_MONTH',
    res.data
  );
  stats = await findDonor(donorBody.oib);
  check(
    'denied donation does not count',
    stats.donationCount === 5 && stats.lastDonation === DAY('2025-01-10'),
    stats
  );
  const actionCount = async () =>
    (await call('GET', '/api/actions?pageSize=100')).data.actions.find(
      (a) => a.id === action.id
    ).donationCount;
  check(
    'denied donation does not count for the action',
    (await actionCount()) === 0
  );
  stats = await findDonor(donorBody.oib);
  check(
    'denied attempt blocks for its period, not the 4-month gap',
    stats.eligibility?.nextEligible === DAY('2026-11-01') &&
      (stats.eligibility.status === 'ELIGIBLE') === (await eligibleNow()),
    stats.eligibility
  );
  res = await call('PUT', `/api/donations/${donation.id}`, {
    body: { ...donationBody, actionId: action.id },
  });
  check(
    'successful donation counts for donor and action',
    res.status === 200 &&
      (await actionCount()) === 1 &&
      (await findDonor(donorBody.oib)).donationCount === 6
  );

  res = await call('GET', `/api/donations?${query({ donorId: donor.id })}`);
  check('donations by donor', res.status === 200 && res.data.count === 1);
  res = await call('GET', `/api/donations?${query({ actionId: action.id })}`);
  check('donations by action', res.status === 200 && res.data.count === 1);
  res = await call('GET', `/api/donations?${query({ sort: 'donor|asc' })}`);
  check('donations sorted by donor', res.status === 200 && res.data.count >= 1);
  res = await call('POST', '/api/donations', { body: { donorId: donor.id } });
  check('invalid donation rejected', res.status === 400, res.status);

  // Detail pages render with data
  for (const path of [
    `/donors/${donor.id}`,
    `/donors/${donor.id}/donations`,
    `/donations/${donation.id}`,
    `/actions/${action.id}`,
  ]) {
    res = await call('GET', path, { raw: true });
    check(`page ${path} renders`, res.status === 200, res.status);
  }
  res = await call('GET', '/donors/00000000-0000-0000-0000-000000000000', {
    raw: true,
  });
  // With the loading screen the page is streamed, so the status is already
  // 200 when the missing donor is found; check what the user sees.
  check(
    'unknown donor page shows "not found"',
    [200, 404].includes(res.status) &&
      res.data.includes('404 - Page not found'),
    res.status
  );

  // Clean up
  res = await call('DELETE', `/api/donations/${donation.id}`);
  check('delete donation', res.status === 200, res.status);
  check(
    'deleted donation is removed from the totals',
    (await findDonor(donorBody.oib)).donationCount === 5 &&
      (await actionCount()) === 0
  );
  res = await call('DELETE', `/api/actions/${action.id}`);
  check('delete action', res.status === 200, res.status);
  res = await call('DELETE', `/api/donors/${donor.id}`);
  check('delete donor', res.status === 200, res.status);
  res = await call('PUT', `/api/donors/${donor.id}`, { body: donorBody });
  check('update deleted donor is 404', res.status === 404, res.status);
}

main()
  .catch((error) => {
    failures += 1;
    console.error(error);
  })
  .finally(() => {
    console.log(`\n${failures ? `${failures} FAILED` : 'ALL PASSED'}`);
    process.exitCode = failures ? 1 : 0;
  });
