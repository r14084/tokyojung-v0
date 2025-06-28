import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // For now, return a simple response to test if the endpoint works
  res.json({
    message: 'tRPC endpoint placeholder',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  })
}