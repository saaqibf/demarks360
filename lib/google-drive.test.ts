import { describe, expect, it } from 'vitest'
import { parseFolderId } from './google-drive'

describe('parseFolderId', () => {
  it('extracts folder ids from Google Drive folder links', () => {
    expect(parseFolderId('https://drive.google.com/drive/folders/abc_DEF-123?usp=sharing')).toBe('abc_DEF-123')
  })

  it('keeps a raw folder id unchanged', () => {
    expect(parseFolderId('abc_DEF-123')).toBe('abc_DEF-123')
  })
})
