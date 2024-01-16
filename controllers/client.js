export const index = (req, res) => {
  try {
    const { category } = req.query

    res.status(200).render('./pages/index', { category })
  } catch (err) {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const product = (req, res) => {
  try {
    res.status(200).render('./pages/product')
  } catch (err) {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const profile = (req, res) => {
  try {
    res.status(200).render('./pages/profile')
  } catch (err) {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const user = (req, res) => {
  try {
    res.status(200).render('./pages/user')
  } catch (err) {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const checkout = (req, res) => {
  try {
    res.status(200).render('./pages/checkout')
  } catch (err) {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const thankYou = (req, res) => {
  try {
    res.status(200).render('./pages/thankYou')
  } catch (err) {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const payment = (req, res) => {
  try {
    res.status(200).render('./pages/payments', { layout: false })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
