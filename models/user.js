import pool from './databasePool.js'

export const getUser = async (email) =>
  pool.query(
    `
        SELECT id, provider, name, email, password, role
        FROM users
        WHERE email = ?
    `,
    [email]
  )

export const createUser = async (provider, name, email, password, role, picture) => {
  if (provider === 'native') {
    const [result] = await pool.execute(
      `
        INSERT INTO users (provider, name, email, password, role)
        VALUES (?, ?, ?, ?, ?)
    `,
      [provider, name, email, password, role]
    )

    return result.insertId
  }

  if (provider === 'facebook') {
    const [result] = await pool.execute(
      `
      INSERT INTO users (provider, name, email, picture, role)
      VALUES (?, ?, ?, ?, ?)
      `,
      [provider, name, email, picture, role]
    )

    return result.insertId
  }
}
