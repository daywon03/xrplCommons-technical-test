import { XummSdk } from 'xumm-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body.uri) {
    throw createError({ statusCode: 400, message: 'URI is required' })
  }

  if (!config.xamanApiKey || !config.xamanApiSecret) {
    throw createError({
      statusCode: 500,
      message: 'Xaman credentials not configured.',
    })
  }

  const xumm = new XummSdk(config.xamanApiKey, config.xamanApiSecret)

  try {
    // Convert URI to hex for NFTokenMint
    const uriHex = Buffer.from(body.uri, 'utf8').toString('hex').toUpperCase()

    const payload = await xumm.payload.create({
      TransactionType: 'NFTokenMint',
      URI: uriHex,
      Flags: 8, // tfTransferable
      NFTokenTaxon: 0,
    })

    if (!payload) throw new Error('Failed to create mint payload')

    return {
      uuid: payload.uuid,
      qrUrl: payload.refs.qr_png,
      deepLink: payload.next.always,
    }
  } catch (err: any) {
    console.error('Xaman mint error:', err)
    throw createError({ statusCode: 500, message: 'Failed to create mint request' })
  }
})
