import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { getUser, createUser } from '../models/user.js'

const createToken = (user) =>
  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION_IN_SECOND}s`
  })

export const signUp = async (req, res) => {
  try {
    // Set provider
    const provider = 'native'

    // Set role
    const role = 'user'

    // Get req data
    const { name } = req.body
    const { email } = req.body
    const { password } = req.body

    // Verify if the email has already been signed up
    const [isRegistered] = await getUser(email)

    if (isRegistered.length !== 0) {
      return res.status(403).json({ message: `This email has already been registered` })
    }

    // Hash password and create user
    const passwordHash = await argon2.hash(password, {
      secret: Buffer.from(process.env.ARGON2_PEPPER)
    })
    const userID = await createUser(provider, name, email, passwordHash, role)

    // Create token
    const user = {
      id: userID,
      provider,
      name,
      email,
      picture: 'https://schoolvoyage.ga/images/123498.png'
    }

    const accessToken = createToken(user)

    // Create response data
    const data = {
      access_token: accessToken,
      access_expired: process.env.ACCESS_TOKEN_EXPIRATION_IN_SECOND,
      user
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

const signInNative = async (req, res) => {
  const { email } = req.body
  const { password } = req.body

  // Verify the input data
  if (!email) {
    return res.status(400).json({ message: `Email is required` })
  }
  if (!password) {
    return res.status(400).json({ message: `Password is required` })
  }

  // Verify the email exists
  const [result] = await getUser(email)

  if (result.length === 0) {
    return res
      .status(403)
      .json({ message: `User not found. Please check your email and try again` })
  }

  // Verify the password
  const dbPasswordHash = result[0].password
  const passwordMatch = await argon2.verify(dbPasswordHash, password, {
    secret: Buffer.from(process.env.ARGON2_PEPPER)
  })

  if (!passwordMatch) {
    return res.status(403).json({ message: `Password is wrong` })
  }

  // Create token
  const user = {
    id: result[0].id,
    provider: result[0].provider,
    name: result[0].name,
    email: result[0].email
  }

  const accessToken = createToken(user)

  // Create response data
  const data = {
    access_token: accessToken,
    access_expired: process.env.ACCESS_TOKEN_EXPIRATION_IN_SECOND,
    user
  }

  return res
    .status(200)
    .cookie('access_token', accessToken, {
      maxAge: process.env.ACCESS_TOKEN_EXPIRATION_IN_SECOND * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    })
    .json({ data })
}

const signInFacebook = async (req, res) => {
  try {
    const facebookToken = req.body.access_token

    // no token
    if (facebookToken == null) {
      return res.status(401).json({ message: `Unauthorized` })
    }

    const fields = 'id,name,email,picture'

    const response = await axios.get(`https://graph.facebook.com/v18.0/me?fields=${fields}`, {
      headers: {
        Authorization: `Bearer ${facebookToken}`
      }
    })

    const userName = response.data.name
    const userEmail = response.data.email
    const userPicture = response.data.picture.data.url

    const [isExist] = await getUser(userEmail)

    let userId

    if (isExist.length === 0) {
      userId = await createUser('facebook', userName, userEmail, null, null, userPicture)
    } else {
      userId = isExist[0].id
    }

    const user = {
      id: userId,
      provider: 'facebook',
      name: userName,
      email: userEmail,
      picture: userPicture
    }

    const accessToken = createToken(user)

    // Create response data
    const data = {
      access_token: accessToken,
      access_expired: process.env.ACCESS_TOKEN_EXPIRATION_IN_SECOND,
      user
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err.stack)

    if (err.response && err.response.status === 403) {
      return res.status(403).json({ message: `Unauthorized` })
    }
    return res.status(500).json({ message: `Internal Server Error` })
  }
}

export const signIn = async (req, res) => {
  try {
    // Verify the request content type
    const contentType = req.headers['content-type']

    if (contentType !== 'application/json') {
      return res.status(400).json({ message: `Please request with json data` })
    }

    // Verify the provider
    const { provider } = req.body

    if (provider !== 'native' && provider !== 'facebook') {
      return res.status(400).json({ message: `Wrong provider` })
    }

    // Authenticate the sign-in data
    if (provider === 'native') {
      return await signInNative(req, res)
    }
    return await signInFacebook(req, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const getProfile = async (req, res) => {
  try {
    const { user } = res.locals

    // Create response data
    const data = {
      provider: user.provider,
      name: user.name,
      email: user.email,
      picture: user.picture
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
