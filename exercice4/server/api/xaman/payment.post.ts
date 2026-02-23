import { XummSdk } from 'xumm-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body.destination || !body.amount || !body.account) {
    throw createError({
      statusCode: 400,
      message: 'Missing destination, amount, or account.',
    })
  }

  const xumm = new XummSdk(config.xamanApiKey, config.xamanApiSecret)

  try {
    // Convert XRP amount to drops (1 XRP = 1,000,000 drops)
    const amountInDrops = String(Math.round(parseFloat(body.amount) * 1_000_000))

    const payload = await xumm.payload.create({
      TransactionType: 'Payment',
      Account: body.account,
      Destination: body.destination,
      Amount: amountInDrops,
    })

    if (!payload) {
      throw new Error('Failed to create payment payload')
    }

    return {
      uuid: payload.uuid,
      qrUrl: payload.refs.qr_png,
      deepLink: payload.next.always,
    }
  } catch (err: any) {
    console.error('Xaman payment error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to create Xaman payment request.',
    })
  }
})
