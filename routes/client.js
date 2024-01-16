import { Router } from 'express'
import {
  index,
  product,
  profile,
  user,
  checkout,
  thankYou,
  payment
} from '../controllers/client.js'

const router = Router()

router.get('/', index)
router.get('/product', product)
router.get('/profile', profile)
router.get('/user', user)
router.get('/checkout', checkout)
router.get('/thankyou', thankYou)
router.get('/payments', payment)

export default router
