import pool from './databasePool.js'

export const createCampaign = async (productId, story, picture) => {
  const [result] = await pool.execute(
    `INSERT INTO campaigns (product_id, story, picture) VALUES (?, ?, ?)`,
    [productId, story, picture]
  )
  const { insertId } = result

  return insertId
}

export const getCampaigns = async () => {
  const [result] = await pool.query('SELECT * FROM campaigns')

  return result
}
