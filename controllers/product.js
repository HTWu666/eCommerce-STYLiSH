import * as productModel from '../models/product.js'

export const createProduct = async (req, res) => {
  try {
    const data = req.body

    // Create main img url to store in DB
    const mainImgUrl = `${req.files['main-image'][0].filename}`

    // Create product
    const result = await productModel.createProduct(
      data.category,
      data.title,
      data.description,
      data.price,
      data.texture,
      data.wash,
      data.place,
      data.note,
      data.story,
      mainImgUrl
    )
    const productId = result[0].insertId

    // Create variant
    if (Array.isArray(data.colorName)) {
      const variants = data.colorName.map((colorName, index) => [
        productId,
        colorName,
        data.colorCode[index],
        data.size[index],
        data.stock[index]
      ])

      await productModel.createVariants(variants)
    } else {
      const variants = []
      const variant = []
      variant.push(productId, data.colorName, data.colorCode, data.size, data.stock)
      variants.push(variant)
      await productModel.createVariants(variants)
    }

    // Create images
    if (req.files.images !== undefined) {
      const imgUrls = req.files.images.map((file) => [productId, `${file.filename}`])

      await productModel.createImg(imgUrls)
    }

    res.status(201).json({ message: 'Create Successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

const dataFormatting = (rawData) => {
  const formattedData = []

  if (rawData) {
    rawData.products.forEach((product) => {
      // product
      const { id, category, title, description, price, texture, wash, place, note, story } = product
      const main_image = `${process.env.AWS_CDN_URL}/${product['main_image']}`

      // variants
      const variant = rawData.variants.filter((item) => item.product_id === id)
      const colors = variant.map((filteredItem) => ({
        code: filteredItem['color_code'],
        name: filteredItem['color_name']
      }))
      const sizes = variant.map((filteredItem) => filteredItem.size)
      const variants = variant.map((filteredItem) => ({
        color_code: filteredItem['color_code'],
        size: filteredItem.size,
        stock: filteredItem.stock
      }))

      // images
      const images = rawData.images
        .filter((item) => item.product_id === id)
        .map((filteredItem) => `${process.env.AWS_CDN_URL}/${filteredItem.image}`)

      // Get product details into a object
      const formattedProduct = {
        id,
        category,
        title,
        description,
        price,
        texture,
        wash,
        place,
        note,
        story,
        colors,
        sizes,
        variants,
        main_image,
        images
      }

      formattedData.push(formattedProduct)
    })
  }

  return formattedData
}

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params
    const currentPage = parseInt(req.query.paging, 10) || 0
    const offset = currentPage * 6
    const limit = parseInt(process.env.LIMIT_PRODUCT_PER_GET, 10)

    // Get product
    let productList

    if (category !== 'all') {
      productList = await productModel.getProducts(limit, offset, category)
    } else {
      productList = await productModel.getProducts(limit, offset)
    }

    if (!productList) {
      return res.status(400).json({ message: 'No products' })
    }

    const formattedData = dataFormatting(productList)

    if (formattedData.length === 7) {
      const nextPage = currentPage + 1
      const data = formattedData.slice(0, 6)
      return res.status(200).json({ data, next_paging: nextPage })
    }

    return res.status(200).json({ data: formattedData })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const productsSearch = async (req, res) => {
  try {
    const { keyword } = req.query
    const currentPage = parseInt(req.query.paging, 10) || 0
    const offset = currentPage * 6
    const limit = parseInt(process.env.LIMIT_PRODUCT_PER_GET, 10)

    const productList = await productModel.getProducts(limit, offset, null, keyword)
    const formattedData = dataFormatting(productList)

    if (productList === undefined) {
      res.status(400).json({ message: 'Can not find any product' })
    } else if (formattedData.length === 7) {
      const nextPage = currentPage + 1
      const data = formattedData.slice(0, 6)
      res.status(200).json({ data, next_paging: nextPage })
    } else {
      res.status(200).json({ data: formattedData })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const productsDetails = async (req, res, next) => {
  try {
    const id = parseInt(req.query.id, 10)

    const product = await productModel.getProducts(null, null, null, null, id)

    if (product) {
      const formattedData = dataFormatting(product)
      const productsDetail = formattedData[0]
      return res.status(200).json({ data: productsDetail })
    }

    res.status(400).json({ message: `Product doesn't exist` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
