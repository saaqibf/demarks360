import { describe, expect, it } from 'vitest'
import { hasAdminRole } from './roles'

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
