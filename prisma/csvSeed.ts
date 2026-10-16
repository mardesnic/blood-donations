import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { PrismaClient, Gender, BloodType } from '@prisma/client';

const prisma = new PrismaClient();

interface DonorCsvRecord {
  IME: string;
  PREZIME: string;
  'IME OCA'?: string;
  'DATUM ROĐENJA'?: string;
  OIB?: string;
  'MJESTO STANOVANJA'?: string;
  'ADRESA STANOVANJA'?: string;
  'BROJ MOBITELA'?: string;
  EMAIL?: string;
  SPOL?: string;
  AKTIVAN?: string;
  'KRVNA GRUPA'?: string;
  'POČETNO STANJE DARIVANJA (BROJ DO SADA DAROVANE KRVI)'?: string;
  'DATUM ZADNJEG DAVANJA'?: string;
  napomena?: string;
  // add other columns if needed
}

function parseCroatianDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const cleaned = dateStr.trim().replace(/\.$/, '');
  const parts = cleaned.split('.');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map((s) => parseInt(s, 10));
  return isNaN(day) || isNaN(month) || isNaN(year)
    ? null
    : new Date(year, month - 1, day);
}

function mapGender(gender: string | undefined): Gender | null {
  const g = gender?.trim().toUpperCase();
  if (g === 'M') return Gender.MALE;
  if (g === 'Ž') return Gender.FEMALE;
  return null;
}

// Unknown or missing values stay null so a donor is never shown with a guessed
// blood type.
export function mapBloodType(bt: string | null | undefined): BloodType | null {
  const value = bt?.trim().toUpperCase().replace(/^0/, 'O'); // fix "0+" → "O+"
  switch (value) {
    case 'A+':
      return BloodType.A_POSITIVE;
    case 'A-':
      return BloodType.A_NEGATIVE;
    case 'B+':
      return BloodType.B_POSITIVE;
    case 'B-':
      return BloodType.B_NEGATIVE;
    case 'AB+':
      return BloodType.AB_POSITIVE;
    case 'AB-':
      return BloodType.AB_NEGATIVE;
    case 'O+':
      return BloodType.O_POSITIVE;
    case 'O-':
      return BloodType.O_NEGATIVE;
    default:
      if (value) {
        console.warn('Unknown blood type, leaving it empty:', value);
      }
      return null;
  }
}

export async function seedDonorsFromCsv() {
  // Real donor data must never be committed, so the file lives outside git.
  const csvFilePath =
    process.env.DONORS_CSV || path.join(__dirname, 'donors.csv');
  if (!fs.existsSync(csvFilePath)) {
    console.log(`⏭️ No donor CSV at ${csvFilePath}, skipping CSV import`);
    return;
  }
  const records: DonorCsvRecord[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, delimiter: ',' }))
      .on('data', (row) => records.push(row))
      .on('error', reject)
      .on('end', resolve);
  });

  console.log(`📥 Found ${records.length} donor records`);

  for (const record of records) {
    const firstName = record['IME']?.trim() || '';
    const lastName = record['PREZIME']?.trim() || '';
    const gender = mapGender(record['SPOL']);
    const bloodType = mapBloodType(record['KRVNA GRUPA']);

    if (!firstName || !lastName || !gender) {
      console.warn(`⚠️ Skipping record due to missing essential data:`, record);
      continue;
    }

    try {
      await prisma.donor.create({
        data: {
          firstName,
          lastName,
          fatherName: record['IME OCA']?.trim() || null,
          fullName: `${firstName} ${lastName}`,
          dob: parseCroatianDate(record['DATUM ROĐENJA'])!,
          oib: record['OIB']?.trim() || '',
          city: record['MJESTO STANOVANJA']?.trim() || null,
          address: record['ADRESA STANOVANJA']?.trim() || null,
          phone: record['BROJ MOBITELA']?.trim() || null,
          email: record['EMAIL']?.trim() || '',
          gender,
          active: record['AKTIVAN']?.toUpperCase() === 'DA',
          bloodType,
          donationCount: parseInt(
            record['POČETNO STANJE DARIVANJA (BROJ DO SADA DAROVANE KRVI)'] ||
              '0',
            10
          ),
          lastDonation: parseCroatianDate(record['DATUM ZADNJEG DAVANJA']),
          note: record['napomena']?.trim() || null,
        },
      });

      console.log(`✅ Imported: ${firstName} ${lastName}`);
    } catch (error) {
      console.error(
        '❌ Error importing donor:',
        firstName,
        lastName,
        '\n',
        error
      );
    }
  }

  console.log('🎉 CSV import complete.');
}
