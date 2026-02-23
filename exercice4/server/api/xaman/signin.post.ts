import { XummSdk } from 'xumm-sdk'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  if (!config.xamanApiKey || !config.xamanApiSecret) {
    throw createError({
      statusCode: 500,
      message: 'Xaman API credentials not configured. Set XAMAN_API_KEY and XAMAN_API_SECRET in .env',
    })
  }

  const xumm = new XummSdk(config.xamanApiKey, config.xamanApiSecret)

  try {
    // Create a SignIn payload (no transaction, just authentication)
    const payload = await xumm.payload.create({
      TransactionType: 'SignIn',
    })

    if (!payload) {
      throw new Error('Failed to create sign-in payload')
    }

    return {
      uuid: payload.uuid,
      qrUrl: payload.refs.qr_png,
      deepLink: payload.next.always,
    }
  } catch (err: any) {
    console.error('Xaman sign-in error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to create Xaman sign-in request.',
    })
  }
})
