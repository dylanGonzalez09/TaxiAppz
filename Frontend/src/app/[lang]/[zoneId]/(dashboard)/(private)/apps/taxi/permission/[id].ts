import type { NextApiRequest, NextApiResponse } from 'next'

import { fetchPrivillage } from '@apis/privillege'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  try {
    const privilegeData = await fetchPrivillage(id)

    res.status(200).json(privilegeData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch privilege data' })
  }
}
