import { describe, expect, it } from 'vitest';
import { FailureLimiter } from '@/lib/rateLimit';

describe('FailureLimiter', () => {
  it('ignores null, undefined and empty keys', () => {
    const limiter = new FailureLimiter(1, 1000);
    for (const key of [null, undefined, '']) {
      limiter.recordFailure(key, 0);
      expect(limiter.isLimited(key, 0)).toBe(false);
      expect(() => limiter.reset(key)).not.toThrow();
    }
  });

  it('limits a key after the given number of failures', () => {
    const limiter = new FailureLimiter(3, 1000);
    for (let i = 0; i < 2; i++) limiter.recordFailure('a', 0);
    expect(limiter.isLimited('a', 0)).toBe(false);
    limiter.recordFailure('a', 0);
    expect(limiter.isLimited('a', 0)).toBe(true);
    expect(limiter.isLimited('b', 0)).toBe(false);
  });

  it('allows the key again after the window', () => {
    const limiter = new FailureLimiter(1, 1000);
    limiter.recordFailure('a', 0);
    expect(limiter.isLimited('a', 999)).toBe(true);
    expect(limiter.isLimited('a', 1000)).toBe(false);
  });

  it('clears a key on reset', () => {
    const limiter = new FailureLimiter(1, 1000);
    limiter.recordFailure('a', 0);
    limiter.reset('a');
    expect(limiter.isLimited('a', 0)).toBe(false);
  });
});
