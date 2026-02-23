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

  const body = await readBody(event)
  if (!body.content) {
    throw createError({ statusCode: 400, message: 'Content is required' })
  }

  const db = await getDb()
  const result = await db.collection('comments').updateOne(
    { _id: new ObjectId(id) },
    { $set: { content: body.content, updatedAt: new Date() } }
  )

  if (result.matchedCount === 0) {
    throw createError({ statusCode: 404, message: 'Comment not found' })
  }

  return { success: true }
})
