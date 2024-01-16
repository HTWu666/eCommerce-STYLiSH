import express from 'express'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import amqp from 'amqplib'
import expressLayouts from 'express-ejs-layouts'
import cookieParser from 'cookie-parser'
import morganBody from 'morgan-body'
import fs from 'fs'
import productRouter from './routes/product.js'
import userRouter from './routes/user.js'
import orderRouter from './routes/order.js'
import campaignRouter from './routes/campaign.js'
import clientRouter from './routes/client.js'
import adminPagesRouter from './routes/adminPages.js'
import rateLimiter from './middlewares/rateLimiter.js'
import { errorHandler } from './utils/errorHandlers.js'

dotenv.config()

// Instantiate Express app
const app = express()

app.use(express.json()) // parse json
app.use(express.urlencoded({ extended: false })) // parse urlencoded
app.use(cookieParser()) // parse cookie

// view engine
app.set('view engine', 'ejs')
app.set('views', './views')
app.use(expressLayouts)
app.set('layout', './layouts/layout')

// static file path
app.use(express.static('public'))
app.use(express.static('uploads'))

// log
const log = fs.createWriteStream('./logs/morganBody/morganBody.log', { flags: 'a' })
morganBody(app, {
  noColors: true,
  stream: log
})

// API
app.use('/api/1.0', rateLimiter, [productRouter, userRouter, orderRouter, campaignRouter])

app.use('/admin', adminPagesRouter)
app.use('/', clientRouter)

// 404 not found
app.all('*', (req, res) => {
  res.status(404).render('./error/notFound')
})

// Global error handler
app.use(errorHandler)

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on ${process.env.PORT}`)
})

const outputLogStream = fs.createWriteStream('./logs/console/console.log', { flags: 'a' })

if (process.env.SERVER_STATUS === 'production') {
  const originalConsoleLog = console.log
  console.log = (...args) => {
    const message = args.join(' ')
    outputLogStream.write(`${message}\n`)
    originalConsoleLog(...args)
  }

  const originalConsoleError = console.error
  console.error = (...args) => {
    const message = args.join(' ')
    outputLogStream.write(`[ERROR] ${message}\n`)

    for (const arg of args) {
      if (arg instanceof Error) {
        outputLogStream.write(`[ERROR Stack Trace] ${arg.stack}\n`)
      }
    }

    originalConsoleError(...args)
  }
}
