import { decode } from 'msgpack-lite'

export function decodeMessagePackAsset<T>(url: string): T {
  const bytes = Uint8Array.from(atob(url.slice(url.indexOf(',') + 1)), (byte) => byte.charCodeAt(0))
  return decode(bytes) as T
}
