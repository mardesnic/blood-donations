import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@/lib/const';
import { APP_TIME_ZONE } from '@/lib/dates';

dayjs.extend(utc);
dayjs.extend(timezone);

// "15.04.2027. 08:00–14:00", or both dates when it ends on another day.
// Always in the app's time zone, so the server renders the same times the
// users see.
export function actionTimesText(start: Date | string, end: Date | string) {
  const from = dayjs(start).tz(APP_TIME_ZONE);
  const to = dayjs(end).tz(APP_TIME_ZONE);
  const sameDay = from.format(DATE_FORMAT) === to.format(DATE_FORMAT);
  return `${from.format(DATE_TIME_FORMAT)}–${to.format(
    sameDay ? 'HH:mm' : DATE_TIME_FORMAT
  )}`;
}

export const ActionTimes = ({
  start,
  end,
}: {
  start: Date | string;
  end: Date | string;
}) => <>{actionTimesText(start, end)}</>;
