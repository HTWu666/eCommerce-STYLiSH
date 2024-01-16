import { Router } from 'express'
import checkout from '../controllers/order.js'
import authenticate from '../middlewares/authenticate.js'

const router = Router()

router.post('/order/checkout', authenticate, checkout)

export default router
