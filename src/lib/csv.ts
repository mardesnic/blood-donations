import { format } from 'fast-csv';

// Rows as CSV text with a header row, even when there are no rows. Starts
// with a byte-order mark so Excel reads the file as UTF-8.
export async function toCsv(
  columns: string[] | null | undefined,
  rows: (string | number)[][] | null | undefined
): Promise<string> {
  const csv = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = format({
      headers: columns || [],
      alwaysWriteHeaders: !!columns?.length,
    });
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () =>
      resolve(
        Buffer.concat(chunks as unknown as Uint8Array[]).toString('utf-8')
      )
    );
    (rows || []).forEach((row) => stream.write(row));
    stream.end();
  });
  return `\uFEFF${csv}`;
}
