function ghanaPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('0')) return `233${digits.slice(1)}`
  if (digits.startsWith('233')) return digits
  return digits
}

export async function sendOwnerOrderSms({ reference, amount, customer }: { reference: string; amount?: number; customer?: string }) {
  const apiKey = process.env.SMS_API_KEY
  const to = process.env.OWNER_SMS_NUMBER
  const from = process.env.SMS_SENDER_ID
  if (!apiKey || !to || !from) return false

  const message = `Bongo Stores: payment received for ${reference}${customer ? ` from ${customer}` : ''}${amount ? ` (GH₵${(amount / 100).toFixed(2)})` : ''}. Ready to source.`
  const params = new URLSearchParams({ action: 'send-sms', api_key: apiKey, to: ghanaPhoneNumber(to), from, sms: message })
  const response = await fetch(`https://sms.arkesel.com/sms/api?${params.toString()}`, { method: 'GET', cache: 'no-store' })
  return response.ok
}
