import { XummSdk } from 'xumm-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const uuid = query.uuid as string

  if (!uuid) {
    throw createError({ statusCode: 400, message: 'Missing uuid parameter' })
  }

  const xumm = new XummSdk(config.xamanApiKey, config.xamanApiSecret)

  try {
    const payload = await xumm.payload.get(uuid)
    if (!payload) throw new Error('Payload not found')

    return {
      resolved: payload.meta.resolved,
      signed: payload.meta.signed,
      account: payload.response.account || undefined,
      txHash: payload.response.txid || undefined,
    }
  } catch (err: any) {
    console.error('Xaman status error:', err)
    throw createError({ statusCode: 500, message: 'Failed to check status' })
  }
})
