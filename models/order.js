export const createOrder = async (connection, order) => {
  const [result] = await connection.execute(
    `
    INSERT INTO orders 
        (
            user_id,
            shipping,
            payment,
            subtotal,
            freight,
            total,
            consumer_name,
            consumer_phone,
            consumer_email,
            delivery_address,
            delivery_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    order
  )

  return result.insertId
}

export const createOrderList = async (connection, orderId, lists) => {
  const placeholders = lists.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')
  const values = lists.map((item) => [orderId, ...item]).flat()

  const [result] = await connection.execute(
    `
        INSERT INTO lists
            (
                order_id,
                product_id,
                product_name,
                price,
                color_code,
                color_name,
                size,
                quantity
            ) VALUES ${placeholders}
    `,
    values
  )

  return result.insertId
}

export const updateOrder = async (connection, orderId, status) => {
  const [result] = await connection.execute(
    `
        UPDATE orders
        SET status = ?
        WHERE id = ?
    `,
    [status, orderId]
  )

  return result
}

export const createPaymentRecord = async (connection, paymentRecord) => {
  const result = await connection.execute(
    `INSERT INTO payment_records
        (
            order_id,
            amount,
            acquirer,
            currency,
            rec_trade_id,
            bank_transaction_id,
            auth_code,
            card_country,
            card_last_four,
            card_bin_code,
            transaction_time,
            bank_transaction_start_time,
            bank_transaction_end_time,
            card_identifier,
            merchant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?)
    `,
    paymentRecord
  )

  return result.insertId
}
