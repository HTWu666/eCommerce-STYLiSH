import axios from 'axios'
import { createOrder, createOrderList, updateOrder } from '../models/order.js'
import { checkStockWithLock, updateStock } from '../models/product.js'
import pool from '../models/databasePool.js'

const checkout = async (req, res, next) => {
  try {
    const { user } = res.locals
    const userId = user.id
    const { prime, order } = req.body
    const partnerKey = process.env.PARTNER_KEY
    const merchantId = process.env.MERCHANT_ID
    const { shipping, payment, subtotal, freight, total, recipient, list } = order
    const { name, phone, email, address, time } = recipient
    const orderDetails = [
      userId,
      shipping,
      payment,
      subtotal,
      freight,
      total,
      name,
      phone,
      email,
      address,
      time
    ]
    const transformList = list.map((product) => [
      product.id,
      product.name,
      product.price,
      product.color.name,
      product.color.code,
      product.size,
      product.qty
    ])

    // Verify the data
    const requiredData = [
      prime,
      shipping,
      payment,
      subtotal,
      freight,
      total,
      name,
      phone,
      email,
      address,
      time
    ]

    requiredData.forEach((item) => {
      if (!item) {
        return res.status(400).json({ message: `Please filled in ${item}` })
      }
    })

    if (list.length === 0) {
      return res.status(400).json({ message: 'Please choose one product' })
    }

    // Get a connection for the transaction
    const connection = await pool.getConnection()

    try {
      // Begin transaction
      await connection.beginTransaction()

      // Check the stock and lock the product
      const checkStockResults = await checkStockWithLock(connection, list)

      // Formate data for update stock
      const variantIdsWithNewStock = []
      for (let i = 0; i < list.length; i++) {
        const item = {}
        item.id = checkStockResults[i].id
        item.stock = checkStockResults[i].stock - list[i].qty
        variantIdsWithNewStock.push(item)
      }

      // Update the stock
      await updateStock(connection, variantIdsWithNewStock)

      // Create the order
      const orderId = await createOrder(connection, orderDetails)

      // Create the order list
      await createOrderList(connection, orderId, transformList)

      // Pay by prime API
      const response = await axios.post(
        'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime',
        {
          prime,
          partner_key: partnerKey,
          merchant_id: merchantId,
          details: 'TapPay Test',
          amount: total,
          cardholder: {
            phone_number: phone,
            name,
            email,
            address
          },
          remember: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': partnerKey
          }
        }
      )

      if (response.data.status !== 0) {
        return res.status(400).json({ message: 'Transaction Failed' })
      }

      // Update the status of order
      await updateOrder(connection, orderId, 'paid')

      // End of transaction
      await connection.commit()

      const data = { number: orderId }

      res.status(200).json({ data })
    } catch (err) {
      console.error(err.stack)
      // If anything wrong during transaction, then rollback
      await connection.rollback()
      if (err.status === 404) {
        res.status(404).json({ message: err.message })
      } else {
        res.status(500).json({ message: 'Internal Server Error' })
      }
    } finally {
      connection.release()
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export default checkout
