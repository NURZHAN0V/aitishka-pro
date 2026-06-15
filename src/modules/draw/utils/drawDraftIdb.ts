import { DRAW_DRAFT_IDB_NAME, DRAW_DRAFT_IDB_STORE, DRAW_DRAFT_IDB_VERSION, DRAW_DRAFT_STORAGE_KEY } from '@/modules/draw/types/draw-editor'

/** Открывает БД IndexedDB для черновика рисовалки (один object store, ключ — DRAW_DRAFT_STORAGE_KEY). */
function openDrawDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB недоступен'))
      return
    }
    const req = indexedDB.open(DRAW_DRAFT_IDB_NAME, DRAW_DRAFT_IDB_VERSION)
    req.onerror = (): void => {
      reject(req.error ?? new Error('indexedDB.open'))
    }
    req.onsuccess = (): void => {
      resolve(req.result)
    }
    req.onupgradeneeded = (): void => {
      const db = req.result
      if (!db.objectStoreNames.contains(DRAW_DRAFT_IDB_STORE)) {
        db.createObjectStore(DRAW_DRAFT_IDB_STORE)
      }
    }
  })
}

/** Читает сериализованный JSON черновика из IndexedDB. */
export async function readDrawDraftFromIdb(): Promise<string | null> {
  try {
    const db = await openDrawDraftDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DRAW_DRAFT_IDB_STORE, 'readonly')
      tx.onerror = (): void => {
        reject(tx.error ?? new Error('idb read transaction'))
      }
      tx.onabort = (): void => {
        reject(tx.error ?? new Error('idb read abort'))
      }
      tx.oncomplete = (): void => {
        db.close()
      }
      const getReq = tx.objectStore(DRAW_DRAFT_IDB_STORE).get(DRAW_DRAFT_STORAGE_KEY)
      getReq.onerror = (): void => {
        reject(getReq.error ?? new Error('idb get'))
      }
      getReq.onsuccess = (): void => {
        const v = getReq.result
        resolve(typeof v === 'string' ? v : null)
      }
    })
  }
  catch {
    return null
  }
}

/** Записывает черновик в IndexedDB. */
export async function writeDrawDraftToIdb(json: string): Promise<boolean> {
  try {
    const db = await openDrawDraftDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DRAW_DRAFT_IDB_STORE, 'readwrite')
      tx.onerror = (): void => {
        reject(tx.error ?? new Error('idb write transaction'))
      }
      tx.onabort = (): void => {
        reject(tx.error ?? new Error('idb write abort'))
      }
      tx.oncomplete = (): void => {
        db.close()
        resolve()
      }
      tx.objectStore(DRAW_DRAFT_IDB_STORE).put(json, DRAW_DRAFT_STORAGE_KEY)
    })
    return true
  }
  catch {
    return false
  }
}
