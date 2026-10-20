import { describe, expect, it } from 'vitest';
import { toCsv } from '@/lib/csv';

describe('toCsv', () => {
  it('is just the byte-order mark for null, undefined and empty input', async () => {
    expect(await toCsv(null, null)).toBe('\uFEFF');
    expect(await toCsv(undefined, undefined)).toBe('\uFEFF');
    expect(await toCsv([], [])).toBe('\uFEFF');
  });

  it('writes the header row even without rows', async () => {
    expect(await toCsv(['#', 'Ime'], [])).toBe('\uFEFF#,Ime');
  });

  it('quotes values with commas', async () => {
    expect(await toCsv(['#', 'Ime'], [[1, 'Horvat, Ana']])).toBe(
      '\uFEFF#,Ime\n1,"Horvat, Ana"'
    );
  });
});
