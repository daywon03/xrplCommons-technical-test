import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (db) return db

  const config = useRuntimeConfig()
  client = new MongoClient(config.mongoUri)
  await client.connect()
  db = client.db()
  return db
}
