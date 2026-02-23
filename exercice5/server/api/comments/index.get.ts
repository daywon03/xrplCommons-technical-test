import { getDb } from '../../utils/mongodb'

export default defineEventHandler(async () => {
  const db = await getDb()
  const comments = await db.collection('comments')
    .find()
    .sort({ createdAt: -1 })
    .toArray()

  return comments
})
