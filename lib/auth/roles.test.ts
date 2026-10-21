import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/admin-emails', () => ({
  isAdminEmail: (email?: string | null) => email?.toLowerCase() === 'owner@example.com',
}))

import { hasAdminRole, isAdminUser } from './roles'

describe('hasAdminRole', () => {
  it('accepts admin from metadata, custom claims, and organization role claims', () => {
    expect(hasAdminRole({ publicMetadata: { role: 'admin' } })).toBe(true)
    expect(hasAdminRole({ privateMetadata: { role: 'admin' } })).toBe(true)
    expect(hasAdminRole({ metadata: { role: 'admin' } })).toBe(true)
    expect(hasAdminRole({ org_role: 'org:admin' })).toBe(true)
    expect(hasAdminRole({ orgRole: 'admin' })).toBe(true)
  })

  it('rejects signed-in users without an admin role', () => {
    expect(hasAdminRole(undefined)).toBe(false)
    expect(hasAdminRole({ publicMetadata: { role: 'member' } })).toBe(false)
    expect(hasAdminRole({ org_role: 'org:member' })).toBe(false)
  })
})

describe('isAdminUser', () => {
  it('accepts an allow-listed primary email with no admin role', () => {
    expect(isAdminUser({ primaryEmailAddress: { emailAddress: 'Owner@example.com' } })).toBe(true)
  })

  it('rejects a signed-up stranger with neither role nor allow-listed email', () => {
    expect(isAdminUser({ primaryEmailAddress: { emailAddress: 'stranger@example.com' } })).toBe(false)
  })

  it('rejects a missing user', () => {
    expect(isAdminUser(null)).toBe(false)
  })
})
