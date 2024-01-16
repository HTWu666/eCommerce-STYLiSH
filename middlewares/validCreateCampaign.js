import validator from 'validator'

const validCreateCampaign = (req, res, next) => {
  // Check if field is filled
  const requiredField = ['product_id', 'story']
  const emptyField = requiredField.find((field) => !req.body[field])

  if (emptyField) {
    return res.status(400).json({ message: `Please fill in ${emptyField}` })
  }

  // Verify the product id
  if (!validator.isInt(req.body.product_id, { min: 0 })) {
    return res.status(400).json({ message: 'Product ID must be an integer' })
  }

  // Verify the story
  if (!validator.isLength(req.body.story, { min: 1, max: 60000 })) {
    return res
      .status(400)
      .json({ message: 'The length of wash should be lower than 50 characters' })
  }

  // Check the picture field
  if (!req.file) {
    return res.status(400).json({ message: 'Please select one picture' })
  }

  next()
}

export default validCreateCampaign
