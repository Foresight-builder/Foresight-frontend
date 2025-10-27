import fs from 'fs'
import path from 'path'

export interface LocalFollowRecord {
  user_id: string
  event_id: number
  created_at: string
}

const DATA_DIR = path.join(process.cwd(), '.data')
const STORE_PATH = path.join(DATA_DIR, 'event_follows.json')

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch {}
}

async function readFileSafe(file: string): Promise<string | null> {
  try {
    return await fs.promises.readFile(file, 'utf-8')
  } catch {
    return null
  }
}

export async function loadStore(): Promise<LocalFollowRecord[]> {
  ensureDir()
  const content = await readFileSafe(STORE_PATH)
  if (!content) return []
  try {
    const data = JSON.parse(content)
    if (Array.isArray(data)) return data as LocalFollowRecord[]
    return []
  } catch {
    return []
  }
}

export async function saveStore(records: LocalFollowRecord[]): Promise<void> {
  ensureDir()
  const json = JSON.stringify(records, null, 2)
  await fs.promises.writeFile(STORE_PATH, json, 'utf-8')
}

export async function addFollow(userId: string, eventId: number): Promise<LocalFollowRecord> {
  const records = await loadStore()
  const exists = records.find(r => r.user_id === userId && r.event_id === eventId)
  if (exists) return exists
  const record: LocalFollowRecord = { user_id: userId, event_id: eventId, created_at: new Date().toISOString() }
  records.push(record)
  await saveStore(records)
  return record
}

export async function removeFollow(userId: string, eventId: number): Promise<boolean> {
  const records = await loadStore()
  const next = records.filter(r => !(r.user_id === userId && r.event_id === eventId))
  const changed = next.length !== records.length
  if (changed) await saveStore(next)
  return changed
}

export async function getFollowersCount(eventId: number): Promise<number> {
  const records = await loadStore()
  return records.filter(r => r.event_id === eventId).length
}

export async function hasFollow(userId: string, eventId: number): Promise<boolean> {
  const records = await loadStore()
  return records.some(r => r.user_id === userId && r.event_id === eventId)
}

export async function getUserFollows(userId: string): Promise<LocalFollowRecord[]> {
  const records = await loadStore()
  return records.filter(r => r.user_id === userId)
}