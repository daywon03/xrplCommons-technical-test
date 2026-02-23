import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body.username || !body.password) {
    throw createError({ statusCode: 400, message: 'Username and password required' })
  }

  // Check against admin credentials from env
  if (body.username !== config.adminUsername || body.password !== config.adminPassword) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  // Generate JWT token
  const token = jwt.sign(
    { username: body.username, role: 'admin' },
    config.jwtSecret,
    { expiresIn: '2h' }
  )

  return { token }
})
