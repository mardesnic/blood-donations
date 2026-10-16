import { DenyReasonType } from '@/generated/prisma/browser';
import * as Yup from 'yup';

// An empty string from a "None" select option means no relation.
const optionalId = () =>
  Yup.string()
    .nullable()
    .default(null)
    .transform((value) => (value === '' ? null : value));

const optionalText = () => Yup.string().nullable().default(null);

// Optional text for a VarChar(100) column; empty input is stored as null.
const optionalShortText = () =>
  Yup.string()
    .trim()
    .max(100)
    .nullable()
    .default(null)
    .transform((value) => (value === '' ? null : value));

export const placeSchema = Yup.object({
  title: Yup.string().trim().required().max(100),
  address: optionalShortText(),
  city: optionalShortText(),
  phone: optionalShortText(),
  email: optionalShortText().email(),
  contactName: optionalShortText(),
  note: optionalText(),
});

export const actionSchema = Yup.object({
  title: Yup.string().trim().required().max(100),
  placeId: optionalId(),
  startDateTime: Yup.date().required(),
  endDateTime: Yup.date().required(),
  note: optionalText(),
});

export const donationSchema = Yup.object({
  donorId: Yup.string().required(),
  actionId: optionalId(),
  denied: Yup.boolean().default(false),
  denyReason: Yup.mixed<DenyReasonType>()
    .oneOf(Object.values(DenyReasonType))
    .nullable()
    .default(null)
    .transform((value) => (value === '' ? null : value)),
  donationDate: Yup.date().required(),
  note: optionalText(),
});

// Validates a request body and keeps only the fields the schema declares, so
// clients can't write columns such as id or donationCount.
export function parseBody<S extends Yup.AnyObjectSchema>(
  schema: S,
  body: unknown
): Promise<Yup.InferType<S>> {
  return schema.validate(body ?? {}, { stripUnknown: true, abortEarly: false });
}
