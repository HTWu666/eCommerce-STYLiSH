import path from 'path'
import multer from 'multer'
import validator from 'validator'
import fs from 'fs'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import s3 from '../utils/S3Instance.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  // Check if field is filled
  const requiredField = ['category', 'title', 'description', 'price', 'texture', 'wash', 'place']
  const emptyField = requiredField.find((field) => !req.body[field])

  if (emptyField) {
    const err = new Error(`Please fill in ${emptyField}`)
    err.status = 400
    return cb(err, false)
  }

  // Verify the category
  if (!validator.isIn(req.body.category.toLowerCase(), ['women', 'men', 'accessories'])) {
    const err = new Error('Wrong category')
    err.status = 400
    return cb(err, false)
  }

  req.body.category = req.body.category.toLowerCase()

  // Verify the title
  if (!validator.isLength(req.body.title, { max: 100 })) {
    const err = new Error('The length of title should be lower than 100 characters')
    err.status = 400
    return cb(err, false)
  }

  // Verify the description
  if (!validator.isLength(req.body.description, { max: 200 })) {
    const err = new Error('The length of description should be lower than 200 characters')
    err.status = 400
    return cb(err, false)
  }

  // Verify the texture
  if (!validator.isLength(req.body.texture, { max: 50 })) {
    const err = new Error('The length of texture should be lower than 50 characters')
    err.status = 400
    return cb(err, false)
  }

  // Verify the wash
  if (!validator.isLength(req.body.wash, { max: 50 })) {
    const err = new Error('The length of wash should be lower than 50 characters')
    err.status = 400
    return cb(err, false)
  }

  // Verify the price
  if (!validator.isInt(req.body.price, { min: 0 })) {
    const err = new Error('Please enter a valid integer in the price field')
    err.status = 400
    return cb(err, false)
  }

  // Verify the note
  if (req.body.note && !validator.isLength(req.body.note, { max: 100 })) {
    const err = new Error('The length of note should be lower than 100 characters')
    err.status = 400
    return cb(err, false)
  }

  // Verify the story
  const inputStory = req.body.story

  if (inputStory !== '') {
    if (!validator.isLength(inputStory, { max: 200 })) {
      const err = new Error('The length of story should be lower than 200 words')
      err.status = 400
      return cb(err, false)
    }
  }

  // Verify the variants when there is only one variant
  if (!Array.isArray(req.body.colorName)) {
    const requiredVariantFields = ['colorName', 'colorCode', 'size', 'stock']

    const transformVariantFieldName = {
      colorName: 'color name',
      colorCode: 'color code',
      size: 'size',
      stock: 'stock'
    }

    const emptyField = requiredVariantFields.find((field) => !req.body[field])

    if (emptyField) {
      const errMessage = transformVariantFieldName[emptyField]
      const err = new Error(`Please fill in ${errMessage}`)
      err.status = 400
      return cb(err, false)
    }

    const inputSizeToUpperCase = req.body.size.toUpperCase()
    const validateSize = ['XS', 'S', 'M', 'L', 'XL']

    if (!validator.isIn(inputSizeToUpperCase, validateSize)) {
      const err = new Error('Wrong size')
      err.status = 400
      return cb(err, false)
    }

    req.body.size = inputSizeToUpperCase
  }

  // Verify the variants when there are many set of variants
  const hasEmptyValue = (column) => {
    if (column.some((value) => value === '')) {
      return true
    }
  }

  if (Array.isArray(req.body.colorName)) {
    if (hasEmptyValue(req.body.colorName)) {
      const err = new Error('Please fill in color name')
      err.status = 400
      return cb(err, false)
    } else if (hasEmptyValue(req.body.colorName)) {
      const err = new Error('Please fill in color code')
      err.status = 400
      return cb(err, false)
    } else if (hasEmptyValue(req.body.size)) {
      const err = new Error('Please fill in size')
      err.status = 400
      return cb(err, false)
    } else if (hasEmptyValue(req.body.stock)) {
      const err = new Error('Please fill in stock')
      err.status = 400
      return cb(err, false)
    }

    const validateSize = []
    req.body.size.forEach((size) => {
      if (!validator.isIn(size.toUpperCase(), ['XS', 'S', 'M', 'L', 'XL'])) {
        const err = new Error('Wrong size')
        err.status = 400
        return cb(err, false)
      }

      validateSize.push(size.toUpperCase())
    })

    req.body.size = validateSize
  }

  // Verify the file type
  if (file.mimetype.split('/')[0] !== 'image') {
    const err = new Error('file is not of the correct type')
    err.status = 400
    return cb(err, false)
  }

  // Check if main image is selected
  if (!req.files || !req.files['main-image']) {
    const err = new Error('Please select main image')
    err.status = 400
    return cb(err, false)
  }

  cb(null, true)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 100000000 } })

export const imgUpload = (req, res, next) => {
  upload.fields([
    { name: 'main-image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ])(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: 'File is too large' })
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({ message: 'Please choose less than 5 images' })
      }
    } else if (err && err.status === 400) {
      res.status(400).json({ message: err.message })
    } else if (err) {
      res.status(500).json({ message: 'Internal Server Error' })
    } else {
      if (req.files['main-image'] !== undefined) {
        // Upload main img to S3
        const mainImgObj = req.files['main-image'][0]
        const mainImgFileStream = fs.createReadStream(mainImgObj.path)

        const mainImgParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: mainImgObj.filename,
          Body: mainImgFileStream,
          ContentType: mainImgObj.mimetype
        }

        await s3.send(new PutObjectCommand(mainImgParams))

        fs.unlink(`./uploads/${mainImgObj.filename}`, (err) => {
          if (err) {
            console.error(err.stack)
          }
        })

        // Upload images to S3
        if (req.files.images !== undefined) {
          req.files.images.forEach(async (img) => {
            const imageFileStream = fs.createReadStream(img.path)

            const imageParams = {
              Bucket: bucketName,
              Key: img.filename,
              Body: imageFileStream,
              ContentType: img.mimetype
            }

            await s3.send(new PutObjectCommand(imageParams))

            fs.unlink(`./uploads/${img.filename}`, (err) => {
              if (err) {
                console.error(err.stack)
              }
            })
          })
        }
      }

      next()
    }
  })
}
