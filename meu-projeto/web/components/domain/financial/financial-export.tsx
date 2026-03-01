'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Receivable, Payable } from '@/types/financial'

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob(['\uFEFF' + content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatDate(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
}

function formatISODate(d: string): string {
  return new Date(d + 'T12:00:00').toISOString().split('T')[0].replace(/-/g, '')
}

// ── CSV Export ──

export function exportReceivablesCsv(receivables: Receivable[]) {
  const header = 'Descrição,Cliente,Valor,Vencimento,Status,Pago em,Notas'
  const rows = receivables.map((r) =>
    [
      `"${r.description}"`,
      `"${r.client_name ?? ''}"`,
      r.amount.toFixed(2),
      formatDate(r.due_date),
      r.status,
      r.paid_at ? formatDate(r.paid_at.split('T')[0]) : '',
      `"${(r.notes ?? '').replace(/"/g, '""')}"`,
    ].join(',')
  )
  downloadFile(
    `contas-receber-${new Date().toISOString().split('T')[0]}.csv`,
    [header, ...rows].join('\n'),
    'text/csv'
  )
}

export function exportPayablesCsv(payables: Payable[]) {
  const header = 'Descrição,Fornecedor,Categoria,Valor,Vencimento,Status,Pago em,Notas'
  const rows = payables.map((p) =>
    [
      `"${p.description}"`,
      `"${p.supplier ?? ''}"`,
      p.category,
      p.amount.toFixed(2),
      formatDate(p.due_date),
      p.status,
      p.paid_at ? formatDate(p.paid_at.split('T')[0]) : '',
      `"${(p.notes ?? '').replace(/"/g, '""')}"`,
    ].join(',')
  )
  downloadFile(
    `contas-pagar-${new Date().toISOString().split('T')[0]}.csv`,
    [header, ...rows].join('\n'),
    'text/csv'
  )
}

// ── OFX Export (Open Financial Exchange) ──

function ofxTransaction(id: string, date: string, amount: number, description: string, type: 'CREDIT' | 'DEBIT'): string {
  const dateFormatted = formatISODate(date)
  return `<STMTTRN>
<TRNTYPE>${type}
<DTPOSTED>${dateFormatted}
<TRNAMT>${type === 'DEBIT' ? -amount : amount}
<FITID>${id}
<MEMO>${description}
</STMTTRN>`
}

function ofxWrapper(transactions: string, startDate: string, endDate: string): string {
  const now = new Date().toISOString().split('T')[0].replace(/-/g, '')
  return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:UTF-8
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS><CODE>0<SEVERITY>INFO</STATUS>
<DTSERVER>${now}
<LANGUAGE>POR
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS><CODE>0<SEVERITY>INFO</STATUS>
<STMTRS>
<CURDEF>BRL
<BANKACCTFROM>
<BANKID>0000
<ACCTID>A7X-LAVANDERIA
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${formatISODate(startDate)}
<DTEND>${formatISODate(endDate)}
${transactions}
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`
}

export function exportFinancialOfx(receivables: Receivable[], payables: Payable[]) {
  const allDates = [
    ...receivables.map((r) => r.due_date),
    ...payables.map((p) => p.due_date),
  ].sort()

  const startDate = allDates[0] ?? new Date().toISOString().split('T')[0]
  const endDate = allDates[allDates.length - 1] ?? startDate

  const transactions = [
    ...receivables
      .filter((r) => r.status === 'paid')
      .map((r) => ofxTransaction(r.id, r.paid_at?.split('T')[0] ?? r.due_date, r.amount, r.description, 'CREDIT')),
    ...payables
      .filter((p) => p.status === 'paid')
      .map((p) => ofxTransaction(p.id, p.paid_at?.split('T')[0] ?? p.due_date, p.amount, p.description, 'DEBIT')),
  ].join('\n')

  downloadFile(
    `financeiro-${new Date().toISOString().split('T')[0]}.ofx`,
    ofxWrapper(transactions, startDate, endDate),
    'application/x-ofx'
  )
}

// ── Botões de Export ──

interface ExportButtonsProps {
  receivables?: Receivable[]
  payables?: Payable[]
}

export function FinancialExportButtons({ receivables, payables }: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      {receivables && receivables.length > 0 && (
        <Button variant="outline" size="sm" onClick={() => exportReceivablesCsv(receivables)}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Receber CSV
        </Button>
      )}
      {payables && payables.length > 0 && (
        <Button variant="outline" size="sm" onClick={() => exportPayablesCsv(payables)}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Pagar CSV
        </Button>
      )}
      {receivables && payables && (receivables.length > 0 || payables.length > 0) && (
        <Button variant="outline" size="sm" onClick={() => exportFinancialOfx(receivables, payables)}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          OFX
        </Button>
      )}
    </div>
  )
}
