export const RADIO_ID_RE = /^[0-9A-Fa-f]{6}$/

export function isValidRadioId(id: string): boolean {
  return id === '' || RADIO_ID_RE.test(id)
}

export function radioIdError(id: string): string | null {
  if (id === '') return null
  if (!/^[0-9A-Fa-f]+$/.test(id)) return 'RadioID must be hexadecimal'
  if (id.length !== 6) return 'RadioID must be exactly 6 characters'
  return null
}
