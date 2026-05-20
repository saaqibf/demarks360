import Mux from '@mux/mux-node'

let _mux: Mux | null = null

export function getMux(): Mux {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error('MUX_TOKEN_ID and MUX_TOKEN_SECRET not configured')
  }
  if (!_mux) {
    _mux = new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET })
  }
  return _mux
}
