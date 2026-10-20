// End-to-end smoke test against a running app with a seeded database (admin
// user plus faker data, no donor CSV). Logs in, then runs list, filter, sort,
// export and create/update/delete cycles for donors, actions and donations.
//
//   node scripts/smoke-test.mjs [baseUrl]   (default http://localhost:3000)
//
// Never point this at production: it creates and deletes records.

import readXlsxFile from 'read-excel-file/node';

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

// An Excel download's first sheet as rows of cells (rows: [] when the
// response isn't an .xlsx file).
async function sheet(path) {
  const res = await fetch(BASE + path, {
    headers: { cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; ') },
  });
  const isXlsx = (res.headers.get('content-type') || '').includes(
    'spreadsheetml'
  );
  const rows = isXlsx
    ? (await readXlsxFile(Buffer.from(await res.arrayBuffer())))[0].data
    : [];
  return { status: res.status, rows };
}

const rowText = (row) => (row || []).join(' | ');

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

  const donorSheet = await sheet('/api/donors/export');
  check(
    'Excel export',
    donorSheet.status === 200 &&
      donorSheet.rows[0]?.[0] === 'Name' &&
      donorSheet.rows.length === total + 1,
    donorSheet.rows.length
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

  // Possible duplicates: same OIB, same name and date of birth.
  const duplicates = async (params) =>
    (await call('GET', `/api/donors/duplicates?${query(params)}`)).data.matches;
  let matches = await duplicates({ oib: donorBody.oib });
  check(
    'duplicate check finds the same OIB',
    matches.some((m) => m.donor.id === donor.id && m.reason === 'oib'),
    matches
  );
  matches = await duplicates({
    firstName: 'smoke',
    lastName: 'TEST',
    dob: donorBody.dob,
  });
  check(
    'duplicate check finds the same name and date of birth',
    matches.some((m) => m.donor.id === donor.id && m.reason === 'nameDob'),
    matches
  );
  matches = await duplicates({ oib: donorBody.oib, excludeId: donor.id });
  check(
    'duplicate check leaves out the donor being edited',
    matches.length === 0
  );
  res = await call('POST', '/api/donors', {
    body: { ...donorBody, firstName: 'Other', email: '' },
  });
  check(
    'second donor with the same OIB is refused',
    res.status === 409 && res.data.code === 'DUPLICATE_OIB',
    res
  );
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
  const filteredSheet = await sheet(
    `/api/donors/export?${new URLSearchParams([
      ['filter', 'gender|is|FEMALE'],
      ['filter', 'active|is|ACTIVE'],
    ])}`
  );
  check(
    'export applies every filter',
    filteredSheet.rows.length ===
      (await count(['gender|is|FEMALE', 'active|is|ACTIVE'])) + 1
  );
  check(
    'export has no "Invalid Date"',
    !filteredSheet.rows.some((row) => rowText(row).includes('Invalid Date'))
  );
  check(
    'export has a Next Eligible column',
    filteredSheet.rows[0]?.includes('Next Eligible')
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
  const otherDonor = (
    await call('GET', `/api/donors?${query({ pageSize: '2' })}`)
  ).data.donors.find((d) => d.id !== donor.id);
  res = await call('PUT', `/api/donations/${donation.id}`, {
    body: { ...donationBody, donorId: otherDonor.id },
  });
  check(
    'moving a donation to another donor is refused',
    res.status === 409 && res.data?.code === 'DONOR_LOCKED',
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

  // A report for the smoke donation's day (successful, 0-) and its Excel files.
  const reportDay = query({ from: '2026-10-01', to: '2026-10-01' });
  res = await call('GET', `/reports?${reportDay}`, { raw: true });
  check(
    'report page for a day',
    res.status === 200 &&
      res.data.includes('Period: 01.10.2026. – 01.10.2026.') &&
      res.data.includes('By month'),
    res.status
  );
  const reportSheet = (table) =>
    sheet(`/api/reports/export?${reportDay}&table=${table}`);
  const successfulRow = (await reportSheet('totals')).rows.find(
    (row) => row[0] === 'Successful donations'
  );
  check(
    'report totals count the donation',
    successfulRow?.[1] >= 1,
    successfulRow
  );
  check(
    'report by blood type includes 0-',
    (await reportSheet('bloodTypes')).rows.some((row) => row[0] === '0-')
  );
  for (const table of [
    'months',
    'actions',
    'genderAge',
    'denyReasons',
    'milestones',
  ]) {
    const report = await reportSheet(table);
    check(
      `report ${table} Excel file`,
      report.status === 200 && report.rows.length > 0,
      report.status
    );
  }
  res = await call('GET', `/api/reports/export?${reportDay}&table=donors`);
  check(
    'report export rejects an unknown table',
    res.status === 400,
    res.status
  );

  res = await call('GET', `/donations/${donation.id}`, { raw: true });
  check(
    'donation page links to its donor and action',
    res.data.includes(`href="/donors/${donor.id}"`) &&
      res.data.includes(`href="/actions/${action.id}"`)
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
      res.data.includes('Milestone') &&
      res.data.includes('Next: 10 (') &&
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
      res.data.includes('Close to a milestone') &&
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
  const croatianSheet = await sheet('/api/donors/export');
  check(
    'export in Croatian',
    croatianSheet.rows[0]?.includes('Sljedeće darivanje')
  );
  const croatianCells = croatianSheet.rows.slice(1).flat();
  check(
    'Croatian export has translated values',
    croatianCells.some((cell) => cell === 'Muško' || cell === 'Žensko') &&
      !croatianCells.some((cell) =>
        [
          'MALE',
          'FEMALE',
          'A_POSITIVE',
          'O_NEGATIVE',
          'true',
          'false',
        ].includes(cell)
      )
  );
  cookies.delete('NEXT_LOCALE');
  res = await call('GET', '/donors', { raw: true });
  check(
    'donors page in English without the cookie',
    res.data.includes('<html lang="en"') && res.data.includes('Donors')
  );

  // Call list and contact log
  const callListCount = async (params) =>
    (
      await call(
        'GET',
        `/api/call-list?${query({ bloodType: 'O_NEGATIVE', ...params })}`
      )
    ).data.count;
  const smokeEligible = await eligibleNow();
  const beforeContact = await callListCount({});
  res = await call('POST', `/api/donors/${donor.id}/communications`, {
    body: { type: 'FAX' },
  });
  check('contact with unknown type rejected', res.status === 400, res.status);
  res = await call(
    'POST',
    '/api/donors/00000000-0000-0000-0000-000000000000/communications',
    { body: { type: 'CALL' } }
  );
  check('contact for missing donor is 404', res.status === 404, res.status);
  res = await call('POST', `/api/donors/${donor.id}/communications`, {
    body: { type: 'EMAIL', note: '  Coming on Friday  ' },
  });
  const contact = res.data;
  check(
    'log contact',
    res.status === 200 &&
      contact?.type === 'EMAIL' &&
      contact.note === 'Coming on Friday',
    res.data
  );
  check(
    'contacted donor leaves the call list',
    beforeContact - (await callListCount({})) === (smokeEligible ? 1 : 0) &&
      (await callListCount({ hideContacted: '0' })) === beforeContact
  );
  res = await call('GET', `/api/donors/${donor.id}/communications`);
  check(
    'contact history',
    res.status === 200 && res.data.contacts?.[0]?.id === contact?.id,
    res.data
  );
  res = await call('GET', `/donors/${donor.id}`, { raw: true });
  check(
    'donor page shows the last contact',
    res.status === 200 && /Last contacted|Zadnji kontakt/.test(res.data)
  );
  res = await call('GET', '/call-list', { raw: true });
  check('page /call-list renders', res.status === 200, res.status);
  res = await call('DELETE', `/api/communications/${contact.id}`);
  check('delete contact', res.status === 200, res.status);
  res = await call('DELETE', `/api/communications/${contact.id}`);
  check('delete deleted contact is 404', res.status === 404, res.status);
  check(
    'deleted contact puts the donor back',
    (await callListCount({})) === beforeContact
  );
  // Left in place: deleting the donor removes it too.
  res = await call('POST', `/api/donors/${donor.id}/communications`, {
    body: { type: 'CALL' },
  });
  check('log a call', res.status === 200 && res.data?.type === 'CALL');

  // Drive sheets (print page and Excel)
  let driveSheet = await sheet(
    `/api/actions/${action.id}/export?sheet=results`
  );
  check(
    'drive results Excel file lists the donation',
    driveSheet.status === 200 &&
      rowText(driveSheet.rows[1]).includes('Test Smoke'),
    driveSheet.rows
  );
  // Move the drive to tomorrow, so the call just logged falls in the 30
  // days before it.
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  res = await call('PUT', `/api/actions/${action.id}`, {
    body: {
      ...actionBody,
      startDateTime: tomorrow.toISOString(),
      endDateTime: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
    },
  });
  check('move action to tomorrow', res.status === 200, res.status);
  driveSheet = await sheet(`/api/actions/${action.id}/export?sheet=expected`);
  check(
    'expected donors Excel file lists the contacted donor',
    driveSheet.status === 200 &&
      driveSheet.rows.some((row) =>
        /Test Smoke.*(Phone call|Poziv)/.test(rowText(row))
      ),
    driveSheet.rows
  );
  for (const sheet of ['', '?sheet=expected', '?sheet=results']) {
    res = await call('GET', `/actions/${action.id}/print${sheet}`, {
      raw: true,
    });
    check(
      `page /actions/[id]/print${sheet} renders`,
      res.status === 200 && res.data.includes('Test Smoke'),
      res.status
    );
  }
  res = await call(
    'GET',
    '/api/actions/00000000-0000-0000-0000-000000000000/export'
  );
  check('missing action export is 404', res.status === 404, res.status);

  // Users and roles: a volunteer signs in with a temporary password, must
  // change it, can't delete, and is locked out once deactivated. The same
  // volunteer is reused on later runs (users are never deleted).
  const VOLUNTEER_EMAIL = 'smoke.volunteer@example.com';
  const volunteerBody = {
    name: 'Smoke Volunteer',
    email: 'Smoke.Volunteer@Example.com',
    role: 'VOLUNTEER',
  };
  res = await call('POST', '/api/users', { body: volunteerBody });
  let volunteer = res.data?.user;
  let temporaryPassword = res.data?.temporaryPassword;
  if (res.status === 409) {
    check(
      'duplicate user email is refused',
      res.data?.code === 'DUPLICATE_EMAIL'
    );
    volunteer = (await call('GET', '/api/users')).data.users.find(
      (u) => u.email === VOLUNTEER_EMAIL
    );
    await call('PUT', `/api/users/${volunteer.id}`, {
      body: { ...volunteerBody, active: true },
    });
    res = await call('POST', `/api/users/${volunteer.id}/reset-password`);
    temporaryPassword = res.data?.temporaryPassword;
  }
  check(
    'create volunteer with a temporary password',
    volunteer?.email === VOLUNTEER_EMAIL &&
      /^[A-Za-z2-9]{12}$/.test(temporaryPassword || ''),
    res.data
  );
  res = await call('POST', '/api/users', { body: volunteerBody });
  check(
    'duplicate user email is refused',
    res.data?.code === 'DUPLICATE_EMAIL'
  );
  res = await call('PUT', `/api/users/${session.user.id}`, {
    body: { name: 'Admin', email: ADMIN.email, role: 'VOLUNTEER' },
  });
  check('admin cannot demote themselves', res.data?.code === 'SELF_CHANGE');

  const adminCookies = new Map(cookies);
  const signIn = async (email, password) => {
    cookies.clear();
    const { data: csrfData } = await call('GET', '/api/auth/csrf');
    await call('POST', '/api/auth/callback/credentials', {
      form: { csrfToken: csrfData.csrfToken, email, password, json: 'true' },
      redirect: 'manual',
    });
    return (await call('GET', '/api/auth/session')).data;
  };
  // Upper-case letters in the email still sign in.
  let volunteerSession = await signIn(volunteerBody.email, temporaryPassword);
  check(
    'volunteer signs in with the temporary password',
    volunteerSession?.user?.mustChangePassword === true,
    volunteerSession
  );
  res = await call('GET', '/api/donors');
  check(
    'temporary password blocks the API',
    res.status === 403 && res.data?.code === 'PASSWORD_CHANGE_REQUIRED',
    res.data
  );
  res = await call('GET', '/overview', { raw: true, redirect: 'manual' });
  check(
    'temporary password redirects pages to the password change',
    res.status === 307,
    res.status
  );
  const newPassword = 'smoke-volunteer-password';
  res = await call('PUT', '/api/account/password', {
    body: { currentPassword: 'wrong', newPassword },
  });
  check('wrong current password is refused', res.status === 403, res.status);
  res = await call('PUT', '/api/account/password', {
    body: { currentPassword: temporaryPassword, newPassword: 'short' },
  });
  check('short new password is refused', res.status === 400, res.status);
  res = await call('PUT', '/api/account/password', {
    body: { currentPassword: temporaryPassword, newPassword },
  });
  check('volunteer changes the password', res.status === 200, res.data);
  // What the form's update() does: refresh the session token.
  const { data: volunteerCsrf } = await call('GET', '/api/auth/csrf');
  await call('POST', '/api/auth/session', {
    body: { csrfToken: volunteerCsrf.csrfToken, data: {} },
  });
  res = await call('GET', '/overview', { raw: true, redirect: 'manual' });
  check('pages open after the change', res.status === 200, res.status);

  res = await call('DELETE', `/api/donors/${donor.id}`);
  check(
    'volunteer cannot delete a donor',
    res.status === 403 && res.data?.code === 'ADMIN_ONLY',
    res.data
  );
  res = await call('GET', '/api/users');
  check('volunteer cannot list users', res.status === 403, res.status);
  const adminContact = (
    await call('GET', `/api/donors/${donor.id}/communications`)
  ).data.contacts[0];
  res = await call('DELETE', `/api/communications/${adminContact.id}`);
  check("volunteer cannot delete another's contact", res.status === 403);
  res = await call('POST', `/api/donors/${donor.id}/communications`, {
    body: { type: 'SMS' },
  });
  check(
    'contact records who logged it',
    res.data?.createdBy?.name === 'Smoke Volunteer',
    res.data
  );
  res = await call('DELETE', `/api/communications/${res.data?.id}`);
  check('volunteer deletes their own contact', res.status === 200);
  const volunteerCookies = new Map(cookies);

  cookies.clear();
  adminCookies.forEach((value, key) => cookies.set(key, value));
  res = await call('PUT', `/api/users/${volunteer.id}`, {
    body: { ...volunteerBody, active: false },
  });
  check('deactivate volunteer', res.status === 200 && !res.data.active);
  cookies.clear();
  volunteerCookies.forEach((value, key) => cookies.set(key, value));
  res = await call('GET', '/api/donors');
  check('deactivated user is signed out of the API', res.status === 401);
  volunteerSession = await signIn(VOLUNTEER_EMAIL, newPassword);
  check('deactivated user cannot sign in', !volunteerSession?.user);
  cookies.clear();
  adminCookies.forEach((value, key) => cookies.set(key, value));

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
