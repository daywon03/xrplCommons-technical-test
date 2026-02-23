export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.pinataApiKey || !config.pinataSecretKey) {
    throw createError({
      statusCode: 500,
      message: 'Pinata API credentials not configured. Set PINATA_API_KEY and PINATA_SECRET_KEY in .env',
    })
  }

  try {
    // Read multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, message: 'No file uploaded' })
    }

    const fileField = formData.find(f => f.name === 'file')
    const nameField = formData.find(f => f.name === 'name')

    if (!fileField || !fileField.data) {
      throw createError({ statusCode: 400, message: 'File is required' })
    }

    const fileName = nameField?.data?.toString() || 'clock-nft'

    // Upload to Pinata using their API
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2)
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName}.png"\r\n`),
      Buffer.from(`Content-Type: image/png\r\n\r\n`),
      fileField.data,
      Buffer.from(`\r\n--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="pinataMetadata"\r\n`),
      Buffer.from(`Content-Type: application/json\r\n\r\n`),
      Buffer.from(JSON.stringify({ name: `${fileName}-nft` })),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ])

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': config.pinataApiKey,
        'pinata_secret_api_key': config.pinataSecretKey,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pinata error:', errorText)
      throw new Error('Pinata upload failed')
    }

    const result = await response.json() as { IpfsHash: string }
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`

    return { ipfsUrl }
  } catch (err: any) {
    console.error('IPFS upload error:', err)
    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to upload to IPFS',
    })
  }
})
