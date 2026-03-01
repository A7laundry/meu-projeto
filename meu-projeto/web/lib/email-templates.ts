const STATUS_LABELS: Record<string, string> = {
  received: 'Recebida',
  sorting: 'Em Triagem',
  washing: 'Lavando',
  drying: 'Secando',
  ironing: 'Passando',
  ready: 'Pronta para Retirada',
  shipped: 'Saiu para Entrega',
  delivered: 'Entregue',
}

const STATUS_EMOJI: Record<string, string> = {
  received: '📥',
  sorting: '📋',
  washing: '🧺',
  drying: '☀️',
  ironing: '👔',
  ready: '✅',
  shipped: '🚚',
  delivered: '🎉',
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
    <!-- Header -->
    <div style="background:#07080f;padding:24px 28px;text-align:center">
      <span style="font-size:24px;font-weight:800;color:#60a5fa;letter-spacing:-0.5px">A7x</span>
      <span style="font-size:14px;color:rgba(255,255,255,0.4);margin-left:8px">Lavanderia</span>
    </div>
    <!-- Content -->
    <div style="padding:28px">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding:16px 28px;background:#fafafa;border-top:1px solid #eee;text-align:center">
      <p style="margin:0;font-size:12px;color:#999">
        A7x TecNologia — Sistema Operacional de Lavanderia
      </p>
    </div>
  </div>
</div>
</body></html>`
}

export function orderStatusEmail(params: {
  clientName: string
  orderNumber: string
  newStatus: string
  unitName: string
  totalPieces: number
}): { subject: string; html: string } {
  const { clientName, orderNumber, newStatus, unitName, totalPieces } = params
  const label = STATUS_LABELS[newStatus] ?? newStatus
  const emoji = STATUS_EMOJI[newStatus] ?? '📦'

  const isReady = newStatus === 'ready'
  const isShipped = newStatus === 'shipped'
  const isDelivered = newStatus === 'delivered'

  let actionText = ''
  if (isReady) actionText = '<p style="margin:16px 0 0;font-size:14px;color:#059669;font-weight:600">Sua comanda está pronta! Passe na unidade para retirar.</p>'
  if (isShipped) actionText = '<p style="margin:16px 0 0;font-size:14px;color:#2563eb;font-weight:600">Seu pedido saiu para entrega. Fique atento!</p>'
  if (isDelivered) actionText = '<p style="margin:16px 0 0;font-size:14px;color:#059669;font-weight:600">Obrigado pela preferência! Esperamos você novamente.</p>'

  const subject = `${emoji} Comanda #${orderNumber} — ${label}`

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:14px;color:#666">Olá, <strong>${clientName}</strong></p>
    <h2 style="margin:0 0 20px;font-size:22px;color:#111">
      ${emoji} ${label}
    </h2>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px">
      <table style="width:100%;font-size:14px;color:#444" cellpadding="4">
        <tr><td style="color:#888">Comanda</td><td style="font-weight:700;text-align:right">#${orderNumber}</td></tr>
        <tr><td style="color:#888">Peças</td><td style="text-align:right">${totalPieces}</td></tr>
        <tr><td style="color:#888">Unidade</td><td style="text-align:right">${unitName}</td></tr>
      </table>
    </div>

    ${actionText}
  `)

  return { subject, html }
}

export function npsRequestEmail(params: {
  clientName: string
  orderNumber: string
  npsUrl: string
  unitName: string
}): { subject: string; html: string } {
  const { clientName, orderNumber, npsUrl, unitName } = params

  const subject = `Como foi sua experiência? — Comanda #${orderNumber}`

  const html = baseLayout(`
    <p style="margin:0 0 4px;font-size:14px;color:#666">Olá, <strong>${clientName}</strong></p>
    <h2 style="margin:0 0 12px;font-size:20px;color:#111">
      Sua opinião é muito importante!
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6">
      Sua comanda <strong>#${orderNumber}</strong> da <strong>${unitName}</strong> foi entregue.
      Gostaríamos de saber como foi sua experiência.
    </p>

    <div style="text-align:center;margin:24px 0">
      <a href="${npsUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px">
        Avaliar minha experiência
      </a>
    </div>

    <p style="margin:0;font-size:12px;color:#999;text-align:center">
      Leva menos de 30 segundos. Obrigado!
    </p>
  `)

  return { subject, html }
}

export function maintenanceAlertEmail(params: {
  equipmentName: string
  unitName: string
  reason: string
  urgency: 'low' | 'medium' | 'high'
  managerEmail: string
}): { subject: string; html: string } {
  const { equipmentName, unitName, reason, urgency } = params
  const urgencyLabel = { low: 'Baixa', medium: 'Média', high: 'Alta' }[urgency]
  const urgencyColor = { low: '#059669', medium: '#d97706', high: '#dc2626' }[urgency]

  const subject = `🔧 Manutenção ${urgency === 'high' ? 'URGENTE' : 'necessária'}: ${equipmentName}`

  const html = baseLayout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#111">
      🔧 Alerta de Manutenção
    </h2>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px">
      <table style="width:100%;font-size:14px;color:#444" cellpadding="4">
        <tr><td style="color:#888">Equipamento</td><td style="font-weight:700;text-align:right">${equipmentName}</td></tr>
        <tr><td style="color:#888">Unidade</td><td style="text-align:right">${unitName}</td></tr>
        <tr><td style="color:#888">Urgência</td><td style="text-align:right;font-weight:700;color:${urgencyColor}">${urgencyLabel}</td></tr>
      </table>
    </div>

    <p style="margin:0;font-size:14px;color:#555;line-height:1.6">
      <strong>Motivo:</strong> ${reason}
    </p>
  `)

  return { subject, html }
}
