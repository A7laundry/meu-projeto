import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface OfflineAction {
  id: string
  action: string
  payload: Record<string, unknown>
  timestamp: number
  retries: number
}

interface SynkraDB extends DBSchema {
  offline_queue: {
    key: string
    value: OfflineAction
    indexes: { by_timestamp: number }
  }
}

let db: IDBPDatabase<SynkraDB> | null = null

async function getDB(): Promise<IDBPDatabase<SynkraDB>> {
  if (db) return db
  db = await openDB<SynkraDB>('synkra-offline', 1, {
    upgrade(database) {
      const store = database.createObjectStore('offline_queue', { keyPath: 'id' })
      store.createIndex('by_timestamp', 'timestamp')
    },
  })
  return db
}

export async function enqueueAction(
  action: string,
  payload: Record<string, unknown>
): Promise<void> {
  const database = await getDB()
  const item: OfflineAction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    action,
    payload,
    timestamp: Date.now(),
    retries: 0,
  }
  await database.add('offline_queue', item)
}

export async function getPendingActions(): Promise<OfflineAction[]> {
  const database = await getDB()
  return database.getAllFromIndex('offline_queue', 'by_timestamp')
}

export async function removeAction(id: string): Promise<void> {
  const database = await getDB()
  await database.delete('offline_queue', id)
}

export async function incrementRetries(id: string): Promise<void> {
  const database = await getDB()
  const item = await database.get('offline_queue', id)
  if (item) {
    await database.put('offline_queue', { ...item, retries: item.retries + 1 })
  }
}

export async function drainQueue(
  handler: (action: OfflineAction) => Promise<boolean>
): Promise<{ succeeded: number; failed: number }> {
  const actions = await getPendingActions()
  let succeeded = 0
  let failed = 0

  for (const action of actions) {
    try {
      const ok = await handler(action)
      if (ok) {
        await removeAction(action.id)
        succeeded++
      } else {
        await incrementRetries(action.id)
        failed++
      }
    } catch {
      await incrementRetries(action.id)
      failed++
    }
  }

  return { succeeded, failed }
}
