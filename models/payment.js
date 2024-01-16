import pool from './databasePool.js'

const getPayments = async () => pool.query('SELECT user_id, total FROM order_test')

export default getPayments
