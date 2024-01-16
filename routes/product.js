import { Router } from 'express'
import { param, query } from 'express-validator'
import {
  createProduct,
  getProductsByCategory,
  productsSearch,
  productsDetails
} from '../controllers/product.js'
import { validCreateProduct } from '../middlewares/validCreateProduct.js'
import { imgUpload } from '../middlewares/adminProductsImgUpload.js'
import handleValidationResult from '../middlewares/validator.js'

const router = Router()

router.post('/products/', imgUpload, validCreateProduct, createProduct)
router.get(
  '/products/search',
  query('keyword').not().isEmpty().trim(),
  query('paging').if(query('paging').exists()).isInt(),
  handleValidationResult,
  productsSearch
)
router.get(
  '/products/details',
  query('id').not().isEmpty().trim(),
  handleValidationResult,
  productsDetails
)
router.get(
  '/products/:category',
  param('category').isIn(['all', 'men', 'women', 'accessories']),
  query('paging').if(query('paging').exists()).isInt(),
  handleValidationResult,
  getProductsByCategory
)

export default router
