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
  // Empty values go last in both directions, and equal values keep one
  // order, so paging through a sort shows every donor exactly once.
  const allBy = async (sort) =>
    (await call('GET', `/api/donors?${query({ pageSize: 100, sort })}`)).data
      .donors;
  for (const sort of ['lastDonation|desc', 'lastDonation|asc']) {
    const dates = (await allBy(sort)).map((d) => d.lastDonation);
    const firstEmpty = dates.indexOf(null);
    check(
      `${sort} puts donors without a donation last`,
      firstEmpty === -1 || dates.slice(firstEmpty).every((d) => d === null),
      dates
    );
  }
  const pagedIds = [];
  for (let page = 0; page < 100; page++) {
    const { donors } = (
      await call(
        'GET',
        `/api/donors?${query({ page, pageSize: 3, sort: 'donationCount|asc' })}`
      )
    ).data;
    if (!donors.length) break;
    pagedIds.push(...donors.map((d) => d.id));
  }
  check(
    'paging through a sort with ties shows every donor once',
    new Set(pagedIds).size === pagedIds.length &&
      pagedIds.length === (await allBy('donationCount|asc')).length,
    pagedIds.length
  );

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
  // The filter panel asks for "at least N donations" and part of a city.
  const [atLeastZero, atLeastFive, exactlyFive] = [
    await count(['donationCount|>=|0']),
    await count(['donationCount|>=|5']),
    await count(['donationCount|=|5']),
  ];
  check(
    'minimum donations filter',
    atLeastZero === everyone && atLeastFive >= exactlyFive && exactlyFive >= 1,
    { atLeastZero, atLeastFive, exactlyFive, everyone }
  );
  const cityPart = first.city.slice(1, 4).toLowerCase();
  check(
    'city filter matches part of the name',
    (await count([`city|contains|${cityPart}`])) >= 1,
    cityPart
  );
  // Ranges, checked on the smoke donor (born 1990-05-01, last donation
  // 2025-01-10).
  const findsDonor = async (filters) =>
    (
      await call(
        'GET',
        `/api/donors?${new URLSearchParams([
          ['search', donorBody.oib],
          ...filters.map((f) => ['filter', f]),
        ])}`
      )
    ).data.count === 1;
  const now = new Date();
  const age = now.getUTCFullYear() - 1990 - (now.getUTCMonth() < 4 ? 1 : 0); // before 1 May this year
  check(
    'age range matches the donor',
    (await findsDonor([`age|>=|${age}`, `age|<=|${age}`])) &&
      !(await findsDonor([`age|>=|${age + 1}`])) &&
      !(await findsDonor([`age|<=|${age - 1}`])),
    age
  );
  check(
    'last donation range includes both days',
    (await findsDonor([
      `lastDonation|onOrAfter|${DAY('2025-01-10')}`,
      `lastDonation|onOrBefore|${DAY('2025-01-10')}`,
    ])) &&
      !(await findsDonor([`lastDonation|onOrAfter|${DAY('2025-01-11')}`])) &&
      !(await findsDonor([`lastDonation|onOrBefore|${DAY('2025-01-09')}`]))
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
  // The action's page sums up its donations (one successful, 0-).
  res = await call('GET', `/actions/${action.id}`, { raw: true });
  check(
    'action page shows its result',
    res.status === 200 &&
      res.data.includes('Successful donations') &&
      res.data.includes('0- ×1') &&
      res.data.includes(`/donations/create?actionId=${action.id}`),
    res.status
  );

  // Drive mode: the page and its running count (one successful donation).
  res = await call('GET', `/actions/${action.id}/drive`, { raw: true });
  check(
    'drive mode page',
    res.status === 200 && res.data.includes('Drive mode'),
    res.status
  );
  res = await call('GET', `/api/actions/${action.id}/summary`);
  check(
    'drive mode count',
    res.status === 200 && res.data.successful === 1 && res.data.denied === 0,
    res.data
  );

  // A report for the smoke donation's day (successful, 0-) and its CSVs.
  const reportDay = query({ from: '2026-10-01', to: '2026-10-01' });
  res = await call('GET', `/reports?${reportDay}`, { raw: true });
  check(
    'report page for a day',
    res.status === 200 &&
      res.data.includes('Period: 01.10.2026. – 01.10.2026.') &&
      res.data.includes('By month'),
    res.status
  );
  const reportCsv = async (table) =>
    (
      await call('GET', `/api/reports/export?${reportDay}&table=${table}`, {
        raw: true,
      })
    ).data;
  const totalsCsv = await reportCsv('totals');
  const successfulRow = totalsCsv
    .split('\n')
    .find((line) => line.startsWith('Successful donations,'));
  check(
    'report totals count the donation',
    Number(successfulRow?.split(',')[1]) >= 1,
    successfulRow
  );
  check(
    'report by blood type includes 0-',
    (await reportCsv('bloodTypes')).includes('0-,')
  );
  for (const table of ['months', 'actions', 'genderAge', 'denyReasons']) {
    res = await call('GET', `/api/reports/export?${reportDay}&table=${table}`, {
      raw: true,
    });
    check(
      `report ${table} CSV`,
      res.status === 200 && res.data.length > 0,
      res.status
    );
  }
  res = await call('GET', `/api/reports/export?${reportDay}&table=donors`);
  check(
    'report export rejects an unknown table',
    res.status === 400,
    res.status
  );

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

  // Places: create, list with action counts, update, pages, delete
  res = await call('POST', '/api/places', {
    body: { title: ' Smoke Hall ', city: 'Zagreb', email: '', phone: '' },
  });
  const place = res.data;
  check(
    'create place',
    res.status === 200 && place?.title === 'Smoke Hall' && place.email === null,
    res.data
  );
  res = await call('POST', '/api/places', { body: { title: '' } });
  check('place without title rejected', res.status === 400, res.status);
  res = await call('POST', '/api/actions', {
    body: {
      title: 'Smoke place action',
      placeId: place.id,
      startDateTime: '2026-10-02T08:00:00.000Z',
      endDateTime: '2026-10-02T12:00:00.000Z',
      note: '',
    },
  });
  const placeAction = res.data;
  check('create action at the place', placeAction?.placeId === place.id);
  res = await call('GET', `/actions/${placeAction.id}`, { raw: true });
  check(
    'action page links to its place',
    res.status === 200 &&
      res.data.includes(`/places/${place.id}`) &&
      res.data.includes('Smoke Hall'),
    res.status
  );
  res = await call('GET', `/api/places?${query({ search: 'Smoke Hall' })}`);
  check(
    'places list counts actions',
    res.status === 200 &&
      res.data.count === 1 &&
      res.data.places[0]._count?.actions === 1,
    res.data
  );
  res = await call('PUT', `/api/places/${place.id}`, {
    body: { title: 'Smoke Hall 2', contactName: 'Ana' },
  });
  check(
    'update place',
    res.status === 200 && res.data.contactName === 'Ana',
    res.data
  );
  res = await call('GET', '/places', { raw: true });
  check('page /places renders', res.status === 200, res.status);
  res = await call('GET', `/places/${place.id}`, { raw: true });
  check(
    'place page shows the place and its actions',
    res.status === 200 &&
      res.data.includes('Smoke Hall 2') &&
      res.data.includes('Actions held') &&
      res.data.includes(`/actions/${placeAction.id}`),
    res.status
  );
  res = await call('DELETE', `/api/places/${place.id}`);
  check('delete place', res.status === 200, res.status);
  res = await call('GET', `/api/actions?${query({ pageSize: 100 })}`);
  check(
    'deleting a place keeps its actions, without a place',
    res.data.actions.some((a) => a.id === placeAction.id && a.placeId === null),
    res.data.count
  );
  res = await call('DELETE', `/api/actions/${placeAction.id}`);
  check('delete place action', res.status === 200, res.status);

  // Filters in the donors page URL are applied when the page loads.
  res = await call(
    'GET',
    `/donors?${new URLSearchParams([
      ['filter', 'gender|is|FEMALE'],
      ['filter', 'age|>=|30'],
      ['search', 'Smoke'],
    ])}`,
    { raw: true }
  );
  check(
    'donors page shows filters from the URL',
    res.status === 200 &&
      res.data.includes('Gender: Female') &&
      res.data.includes('Age from: 30') &&
      res.data.includes('value="Smoke"'),
    res.status
  );

  res = await call('GET', '/donors?sort=lastDonation|desc&page=2', {
    raw: true,
  });
  check('donors page with sort and page in the URL', res.status === 200);

  // The donor's overview, its edit page, and the old donations link.
  res = await call('GET', `/donors/${donor.id}`, { raw: true });
  check(
    'donor overview shows eligibility, details and donations',
    res.status === 200 &&
      res.data.includes('Total donations') &&
      res.data.includes('Personal details') &&
      res.data.includes(`/donors/${donor.id}/edit`) &&
      res.data.includes('id="donations"'),
    res.status
  );
  res = await call('GET', `/donors/${donor.id}/edit`, { raw: true });
  check(
    'donor edit page shows the form',
    res.status === 200 && res.data.includes('name="firstName"'),
    res.status
  );
  res = await call('GET', `/donors/${donor.id}/donations`, {
    raw: true,
    redirect: 'manual',
  });
  check(
    'old donor donations link redirects to the overview',
    [307, 308].includes(res.status),
    res.status
  );

  // "New donation" from a donor's page preselects the donor.
  res = await call('GET', `/donors/${donor.id}`, { raw: true });
  check(
    "donor's page links to a new donation for the donor",
    res.data.includes(`/donations/create?donorId=${donor.id}`),
    res.status
  );
  res = await call('GET', `/donations/create?donorId=${donor.id}`, {
    raw: true,
  });
  check(
    'new donation page preselects the donor',
    res.status === 200 && res.data.includes('Smoke Test'),
    res.status
  );

  // The overview is the home page.
  res = await call('GET', '/', { raw: true, redirect: 'manual' });
  check(
    'home page redirects to the overview',
    [307, 308].includes(res.status),
    res.status
  );
  res = await call('GET', '/overview', { raw: true });
  check(
    'overview shows the year, who can donate and the chart',
    res.status === 200 &&
      res.data.includes('Donations this year') &&
      res.data.includes('Can donate now') &&
      res.data.includes('Donations per month') &&
      res.data.includes('filter=eligible%7Cis%7CNOW'),
    res.status
  );

  // Croatian, picked with the language cookie
  cookies.set('NEXT_LOCALE', 'hr');
  res = await call('GET', '/donors', { raw: true });
  check(
    'donors page in Croatian',
    res.status === 200 &&
      res.data.includes('<html lang="hr"') &&
      res.data.includes('Darivatelji'),
    res.status
  );
  res = await call('GET', '/api/donors/export', { raw: true });
  check(
    'export in Croatian',
    res.data.split('\n')[0].includes('Sljedeće darivanje')
  );
  check(
    // (res.text() drops the UTF-8 byte-order mark, so it isn't checked here.)
    'Croatian export has translated values',
    /Muško|Žensko/.test(res.data) &&
      !/,(MALE|FEMALE|A_POSITIVE|O_NEGATIVE|true|false)(,|\n|$)/.test(res.data)
  );
  cookies.delete('NEXT_LOCALE');
  res = await call('GET', '/donors', { raw: true });
  check(
    'donors page in English without the cookie',
    res.data.includes('<html lang="en"') && res.data.includes('Donors')
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
