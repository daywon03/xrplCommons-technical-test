import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

export function verifyToken(event: H3Event): { username: string } {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Missing or invalid token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { username: string }
    return decoded
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' })
  }
}
