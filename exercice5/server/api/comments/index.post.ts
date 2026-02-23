import { getDb } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.author || !body.content) {
    throw createError({ statusCode: 400, message: 'Author and content are required' })
  }

  const db = await getDb()
  const comment = {
    author: body.author,
    content: body.content,
    createdAt: new Date(),
  }

  const result = await db.collection('comments').insertOne(comment)

  return { ...comment, _id: result.insertedId }
})
