import { BloodType, CommunicationType } from '@/generated/prisma/browser';
import { addDays, appDayStart, formatDay, toAppDay } from '@/lib/dates';

// Ways of contacting a donor that can be logged by hand (PUSH is for the app).
export const CONTACT_TYPES = [
  CommunicationType.CALL,
  CommunicationType.SMS,
  CommunicationType.EMAIL,
] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export function isContactType(value: unknown): value is ContactType {
  return CONTACT_TYPES.includes(value as ContactType);
}

// "Hide donors contacted in the last N days"; 0 shows everyone.
export const HIDE_CONTACTED_DAYS = [0, 7, 14, 30, 60, 90] as const;
export const DEFAULT_HIDE_CONTACTED_DAYS = 30;

const MAX_CITY_LENGTH = 100;

export type CallListQuery = {
  bloodTypes: BloodType[];
  city: string;
  hideContactedDays: number;
};

type ParamValue = string | string[] | null | undefined;
type Params = URLSearchParams | Record<string, ParamValue> | null | undefined;

function first(params: Params, key: string): string {
  if (!params) {
    return '';
  }
  const value =
    params instanceof URLSearchParams ? params.get(key) : params[key];
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

// The call list's filters from its URL (or an API request):
// ?bloodType=A_POSITIVE,O_NEGATIVE&city=Zagreb&hideContacted=30
// Unknown values are dropped; a missing hideContacted means the default.
export function parseCallListQuery(params: Params): CallListQuery {
  const allowed = Object.values(BloodType) as string[];
  const bloodTypes = Array.from(
    new Set(
      first(params, 'bloodType')
        .split(',')
        .filter((value) => allowed.includes(value))
    )
  ) as BloodType[];
  const days = first(params, 'hideContacted');
  const hideContactedDays = HIDE_CONTACTED_DAYS.find(
    (allowedDays) => days !== '' && allowedDays === Number(days)
  );
  return {
    bloodTypes,
    city: first(params, 'city').trim().slice(0, MAX_CITY_LENGTH),
    hideContactedDays: hideContactedDays ?? DEFAULT_HIDE_CONTACTED_DAYS,
  };
}

// The URL form of the filters, leaving out defaults.
export function callListToSearchParams(
  query: Partial<CallListQuery> | null | undefined
): URLSearchParams {
  const params = new URLSearchParams();
  if (query?.bloodTypes?.length) {
    params.set('bloodType', query.bloodTypes.join(','));
  }
  if (query?.city?.trim()) {
    params.set('city', query.city.trim());
  }
  if (
    query?.hideContactedDays !== undefined &&
    query.hideContactedDays !== DEFAULT_HIDE_CONTACTED_DAYS
  ) {
    params.set('hideContacted', String(query.hideContactedDays));
  }
  return params;
}

// Contacts from this moment on hide a donor: the start of the app day
// `days` days before today. Null when nothing is hidden.
export function contactedSince(days: number, today: Date): Date | null {
  return days > 0 ? appDayStart(addDays(today, -days)) : null;
}

// The day (in the app's time zone) a contact was logged, or '' when unknown.
export function formatContactDay(
  moment: Date | string | null | undefined
): string {
  return moment ? formatDay(toAppDay(new Date(moment))) : '';
}
