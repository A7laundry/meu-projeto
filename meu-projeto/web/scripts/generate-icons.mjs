#!/usr/bin/env node
/**
 * Gera ícones PNG placeholder para PWA da Synkra.
 * Cor base: #1a1a2e (navy escuro da marca)
 * Execução: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')

function crc32(data) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  let c = 0xffffffff
  for (let i = 0; i < data.length; i++) c = table[(c ^ data[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crcInput = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput), 0)
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

function createPNG(size, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width, height, bit depth (8), color type (2=RGB), compression, filter, interlace
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8; ihdrData[9] = 2
  const ihdr = pngChunk('IHDR', ihdrData)

  // Raw image data: each row has filter byte (0) + RGB pixels
  const rowBytes = 1 + size * 3
  const rawData = Buffer.alloc(size * rowBytes)
  for (let y = 0; y < size; y++) {
    const rowBase = y * rowBytes
    rawData[rowBase] = 0 // filter type: None
    for (let x = 0; x < size; x++) {
      const offset = rowBase + 1 + x * 3
      rawData[offset] = r
      rawData[offset + 1] = g
      rawData[offset + 2] = b
    }
  }

  const idat = pngChunk('IDAT', deflateSync(rawData, { level: 9 }))
  const iend = pngChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

mkdirSync(outDir, { recursive: true })

// Synkra brand color: #1a1a2e
const [r, g, b] = [0x1a, 0x1a, 0x2e]

writeFileSync(join(outDir, 'icon-192.png'), createPNG(192, r, g, b))
writeFileSync(join(outDir, 'icon-512.png'), createPNG(512, r, g, b))

console.log('✅ Ícones PWA gerados em public/icons/')
console.log('   - icon-192.png (192x192)')
console.log('   - icon-512.png (512x512)')
console.log('\n⚠️  Substitua por ícones com logo Synkra para produção.')
