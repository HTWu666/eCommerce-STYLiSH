import pool from './databasePool.js'

const isUserHasRole = async (userId, roleName) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT COUNT(role_id) as count FROM user_role
        LEFT JOIN roles
        ON user_role.role_id = roles.id AND roles.name = ?
        WHERE user_id = ? AND roles.name = ?
      `,
      [roleName, userId, roleName]
    )

    if (!Array.isArray(rows)) {
      throw new Error('invalid rows')
    }

    return rows[0].count > 0
  } catch (err) {
    console.error(err)
    return false
  }
}

export default isUserHasRole
