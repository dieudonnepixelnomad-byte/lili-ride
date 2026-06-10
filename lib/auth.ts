export function formatTelephone(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  if (digits.length === 9) return `+237 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  if (digits.startsWith('237') && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }
  return tel
}
