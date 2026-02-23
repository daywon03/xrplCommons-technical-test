import { ObjectId } from 'mongodb'
import { getDb } from '../../utils/mongodb'
import { verifyToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Admin-only: verify JWT
  verifyToken(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Comment ID required' })
  }

  const db = await getDb()
  const result = await db.collection('comments').deleteOne({ _id: new ObjectId(id) })

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: 'Comment not found' })
  }

  return { success: true }
})
