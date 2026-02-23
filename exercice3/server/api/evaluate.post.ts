import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body.idea || typeof body.idea !== 'string' || !body.idea.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Please provide a business idea.',
    })
  }

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file.',
    })
  }

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a business idea evaluator. When given a business idea, analyze its credibility and return a JSON object with exactly two fields:
- "score": a number from 0 to 10 (0 = not credible at all, 10 = highly credible)
- "feedback": a brief explanation (2-3 sentences max) of why you gave that score.

Respond ONLY with the JSON object, no other text.`,
        },
        {
          role: 'user',
          content: body.idea,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const responseText = completion.choices[0]?.message?.content?.trim() || ''

    // Parse the JSON response
    const parsed = JSON.parse(responseText)

    return {
      score: Math.min(10, Math.max(0, Math.round(Number(parsed.score)))),
      feedback: parsed.feedback || 'No feedback provided.',
    }
  } catch (err: any) {
    console.error('OpenAI API error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to evaluate the idea. Please try again.',
    })
  }
})
