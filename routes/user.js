import { Router } from 'express'
import { body } from 'express-validator'
import { signUp, signIn, getProfile } from '../controllers/user.js'
import authenticate from '../middlewares/authenticate.js'
import handleValidationResult from '../middlewares/validator.js'

const router = Router()

router.post(
  '/user/signup',
  body('email').isEmail().normalizeEmail(),
  body('name').exists().notEmpty().trim(),
  body('password').exists().notEmpty(),
  handleValidationResult,
  signUp
)
router.post('/user/signin', signIn)
router.get('/user/profile', authenticate, getProfile)

export default router
