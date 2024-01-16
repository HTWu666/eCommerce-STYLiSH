import path from 'path'
import multer from 'multer'
import validator from 'validator'
import { PutObjectCommand } from "@aws-sdk/client-s3"
import s3 from '../utils/S3Instance.js'
import fs from 'fs'

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
    const requiredField = ['product_id', 'story']
    const emptyField = requiredField.find(field => !req.body[field])

    if (emptyField) {
        const err = new Error(`Please fill in ${emptyField}`)
        err.status = 400
        return cb(err, false)
    }

    // Verify the product id
    if (!validator.isInt(req.body['product_id'], { min: 0 })) {
        const err = new Error('Product ID must be an integer')
        err.status = 400
        return cb(err, false)
    }

    // Verify the story
    if (!validator.isLength(req.body.story, { min: 1, max: 60000 })) {
        const err = new Error('The length of wash should be lower than 50 characters')
        err.status = 400
        return cb(err, false)
    }
    
    // Verify the file type
    if (file.mimetype.split('/')[0] !== 'image') {
        const err = new Error('file is not of the correct type')
        err.status = 400
        return cb(err, false)
    }

    cb(null, true)
}

const upload = multer({storage, fileFilter, limits: { fileSize: 100000000 }})

export const imgUpload = (req, res, next) => {
    upload.single('picture') (req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File is too large' })
            } else {
            return res,status(400).json({ message: err.code })
            }
        } else if (err && err.status === 400) {
            return res.status(400).json({ message: err.message })
        } else if (err) {
            return res.status(500).json({ message: 'Internal Server Error' })
        } else {
            // Upload campaign picture to S3
            if (req.file !== undefined) {
                const pictureObj = req.file
                const pictureFileStream = fs.createReadStream(pictureObj.path)
        
                const pictureParams = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: pictureObj.filename,
                    Body: pictureFileStream,
                    ContentType: pictureObj.mimetype
                }
        
                await s3.send(new PutObjectCommand(pictureParams))
        
                fs.unlink(`./uploads/${pictureObj.filename}`, err => {
                    if(err) {
                        console.error(err.stack)
                    }
                })
            }

            next()
        }
    })
}
