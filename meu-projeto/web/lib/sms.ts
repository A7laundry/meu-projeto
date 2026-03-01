/**
 * Envio de SMS via Twilio.
 * Graceful degradation: se TWILIO_* não estiver configurado, loga e retorna sucesso.
 */
export async function sendSms(
  to: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from) {
    console.warn('[sms] Twilio não configurado, pulando envio de SMS')
    return { success: true }
  }

  // Normalizar número brasileiro
  const cleanTo = to.replace(/\D/g, '')
  const formattedTo = cleanTo.startsWith('55') ? `+${cleanTo}` : `+55${cleanTo}`

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: from,
        Body: body,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.message ?? `HTTP ${response.status}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao enviar SMS' }
  }
}
