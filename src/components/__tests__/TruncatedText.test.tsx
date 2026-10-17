import { describe, expect, it } from 'vitest';
import { isValidElement } from 'react';
import { TruncatedText } from '@/components/TruncatedText';

describe('TruncatedText', () => {
  it('renders nothing for null, undefined and empty text', () => {
    for (const text of [null, undefined, '']) {
      expect(TruncatedText({ text })).toBeNull();
    }
  });

  it('shows the full text in the tooltip', () => {
    const element = TruncatedText({ text: 'A long note about the donor' });
    expect(isValidElement(element)).toBe(true);
    expect((element as { props: { title: string } } | null)?.props.title).toBe(
      'A long note about the donor'
    );
  });
});
