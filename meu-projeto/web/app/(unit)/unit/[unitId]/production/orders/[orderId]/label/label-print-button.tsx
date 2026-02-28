'use client'

export function LabelPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700"
    >
      Imprimir
    </button>
  )
}
