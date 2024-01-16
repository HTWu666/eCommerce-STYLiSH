import { Router } from 'express'
import adminPage from '../controllers/adminPages.js'
import authenticate from '../middlewares/authenticate.js'
import authorization from '../middlewares/authorize.js'

const router = Router()

router.get('/:category', authenticate, authorization('admin'), adminPage)

export default router
