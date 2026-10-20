import { describe, expect, it } from 'vitest';
import { adminMenuRoutes, menuRoutes } from '@/routes';

describe('menuRoutes', () => {
  it('leaves admin pages out of the main menu', () => {
    const paths = menuRoutes().map((route) => route.path);
    expect(paths).toContain('/donors');
    expect(paths).not.toContain('/users');
  });
});

describe('adminMenuRoutes', () => {
  it('lists the users page for admins only', () => {
    expect(adminMenuRoutes(true).map((route) => route.path)).toEqual([
      '/users',
    ]);
    expect(adminMenuRoutes(false)).toEqual([]);
  });
});
