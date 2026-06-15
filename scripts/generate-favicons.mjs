import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const PUBLIC = join(import.meta.dirname, '..', 'public')
const SOURCE = join(PUBLIC, 'favicon.png')

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
]

async function squareSource() {
  const trimmed = await sharp(SOURCE)
    .trim({ threshold: 10 })
    .toBuffer()

  const { width, height } = await sharp(trimmed).metadata()
  const side = Math.max(width, height)

  return sharp(trimmed)
    .resize(side, side, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()
}

async function resizeTo(buffer, size) {
  return sharp(buffer)
    .resize(size, size, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function main() {
  const square = await squareSource()

  await writeFile(join(PUBLIC, 'favicon.png'), await resizeTo(square, 512))

  const pngBuffers = {}
  for (const { name, size } of SIZES) {
    const buf = await resizeTo(square, size)
    pngBuffers[size] = buf
    await writeFile(join(PUBLIC, name), buf)
  }

  const { default: pngToIco } = await import('png-to-ico')
  const ico = await pngToIco([
    pngBuffers[16],
    pngBuffers[32],
    pngBuffers[48],
  ])
  await writeFile(join(PUBLIC, 'favicon.ico'), ico)

  console.log('Favicons generated in public/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
