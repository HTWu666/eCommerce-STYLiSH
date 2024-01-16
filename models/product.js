import pool from './databasePool.js'

export const createProduct = async (
  category,
  title,
  description,
  price,
  texture,
  wash,
  place,
  note,
  story,
  mainImgUrl
) =>
  pool.execute(
    `
    INSERT INTO products
        (
        category,
        title,
        description,
        price,
        texture,
        wash,
        place,
        note,
        story,
        main_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [category, title, description, price, texture, wash, place, note, story, mainImgUrl]
  )

export const createVariants = async (variants) => {
  const placeholders = variants.map(() => '(?, ?, ?, ?, ?)').join(', ')
  const values = variants.flat()

  const query = `
    INSERT INTO variants (product_id, color_name, color_code, size, stock)
    VALUES ${placeholders}
    `

  const [result] = await pool.execute(
    `
        INSERT INTO variants (product_id, color_name, color_code, size, stock)
        VALUES ${placeholders}
        `,
    values
  )

  return result
}

export const createImg = async (imgUrls) => {
  const placeholders = imgUrls.map(() => '(?, ?)').join(', ')
  const values = imgUrls.flat()

  const [result] = await pool.execute(
    `
        INSERT INTO images (product_id, image) VALUES ${placeholders}
    `,
    values
  )

  return result
}

export const checkStockWithLock = async (connection, productLists) => {
  // Lock the variant and get its stock
  const productInfoList = productLists.map((product) => [
    product.id,
    product.color.name,
    product.color.code,
    product.size
  ])
  const placeholders = productInfoList.map(() => '(?, ?, ?, ?)').join(', ')
  const values = productInfoList.flat()

  const [results] = await connection.query(
    `
        SELECT id, stock
        FROM variants
        WHERE (product_id, color_name, color_code, size) IN (${placeholders})
        FOR UPDATE
    `,
    values
  )

  // Compare the stock and the qty, if the stock is less than qty, then throw error
  for (let i = 0; i < productLists.length; i++) {
    const { stock } = results[i]
    const { qty } = productLists[i]

    if (stock < qty) {
      const err = new Error(`
                product id: ${productLists[i].id},
                product name: ${productLists[i].name},
                color name: ${productLists[i].color.name},
                color code: ${productLists[i].color.code},
                size: ${productLists[i].size}
                is out of stock`)
      err.status = 404
      throw err
    }
  }

  return results
}

export const updateStock = async (connection, variantIdsWithStock) => {
  const caseStatements = variantIdsWithStock.map(() => `WHEN ? THEN ?`).join('\n')
  const ids = variantIdsWithStock.map(() => '?').join(',')

  const values = []
  variantIdsWithStock.map((item) => values.push(item.id, item.stock))
  variantIdsWithStock.map((item) => values.push(item.id))

  const results = await connection.execute(
    `
        UPDATE variants
        SET stock = (CASE id ${caseStatements} END)
        WHERE id IN (${ids})
    `,
    values
  )

  return results
}

const getVariants = async (productIds) => {
  console.log(productIds)
  const [variants] = await pool.query(
    `SELECT product_id, color_name, color_code, size, stock FROM variants WHERE product_id IN (?)`,
    [productIds]
  )

  return variants
}

const getImages = async (productIds) => {
  const [images] = await pool.query(
    `SELECT product_id, image FROM images WHERE product_id IN (?)`,
    [productIds]
  )

  return images
}

export const getProducts = async (
  limit = null,
  offset = null,
  category = null,
  keyword = null,
  productId = null
) => {
  let products

  if (category) {
    ;[products] = await pool.query(`SELECT * FROM products WHERE category = ? LIMIT ? OFFSET ?`, [
      category,
      limit,
      offset
    ])
  }

  if (!category && !keyword && !productId) {
    ;[products] = await pool.query(`SELECT * FROM products LIMIT ? OFFSET ?`, [limit, offset])
  }

  if (keyword) {
    ;[products] = await pool.query(`SELECT * FROM products WHERE title LIKE ? LIMIT ? OFFSET ?`, [
      `%${keyword}%`,
      limit,
      offset
    ])
  }

  if (productId) {
    ;[products] = await pool.query(`SELECT * FROM products WHERE id = ?`, [productId])
  }

  const productIds = products.map((product) => product.id)

  if (productIds.length !== 0) {
    const variants = await getVariants(productIds)
    const images = await getImages(productIds)
    return { products, variants, images }
  }
  return null
}
