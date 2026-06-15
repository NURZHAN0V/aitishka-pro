function buildZipFromContents(files: { name: string, content: Uint8Array }[]): Blob {
  const encoder = new TextEncoder()
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    return c >>> 0
  })
  const crc32 = (bytes: Uint8Array): number => {
    let crc = 0xFFFFFFFF
    for (const b of bytes) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ b) & 0xFF]!
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  for (const file of files) {
    const content = file.content
    const nameBytes = encoder.encode(file.name)
    const crc = crc32(content)

    const localHeader = new Uint8Array(30 + nameBytes.length)
    const localView = new DataView(localHeader.buffer)
    localView.setUint32(0, 0x04034B50, true)
    localView.setUint16(4, 20, true)
    localView.setUint16(8, 0, true)
    localView.setUint16(10, 0, true)
    localView.setUint32(14, crc, true)
    localView.setUint32(18, content.length, true)
    localView.setUint32(22, content.length, true)
    localView.setUint16(26, nameBytes.length, true)
    localHeader.set(nameBytes, 30)
    localParts.push(localHeader, content)

    const centralHeader = new Uint8Array(46 + nameBytes.length)
    const centralView = new DataView(centralHeader.buffer)
    centralView.setUint32(0, 0x02014B50, true)
    centralView.setUint16(4, 20, true)
    centralView.setUint16(6, 20, true)
    centralView.setUint16(10, 0, true)
    centralView.setUint16(12, 0, true)
    centralView.setUint32(16, crc, true)
    centralView.setUint32(20, content.length, true)
    centralView.setUint32(24, content.length, true)
    centralView.setUint16(28, nameBytes.length, true)
    centralView.setUint32(42, offset, true)
    centralHeader.set(nameBytes, 46)
    centralParts.push(centralHeader)

    offset += localHeader.length + content.length
  }

  const centralSize = centralParts.reduce((acc, part) => acc + part.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, 0x06054B50, true)
  endView.setUint16(8, files.length, true)
  endView.setUint16(10, files.length, true)
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, offset, true)

  const blobParts: ArrayBuffer[] = [...localParts, ...centralParts, end].map(part =>
    part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength) as ArrayBuffer,
  )
  return new Blob(blobParts, { type: 'application/zip' })
}

/** Синхронная сборка ZIP в той же задаче, что и клик «Экспорт» (иначе скачивание блокируется). */
export function createZipBlobSync(files: { name: string, content: Uint8Array }[]): Blob {
  return buildZipFromContents(files)
}

export async function createZipBlob(files: { name: string, blob: Blob }[]): Promise<Blob> {
  const filesWithContent: { name: string, content: Uint8Array }[] = []
  for (const file of files) {
    filesWithContent.push({
      name: file.name,
      content: new Uint8Array(await file.blob.arrayBuffer()),
    })
  }
  return buildZipFromContents(filesWithContent)
}
