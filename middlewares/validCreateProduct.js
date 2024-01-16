import validator from 'validator'

export const validCreateProduct = (req, res, next) => {
    const requiredField = ['category', 'title', 'description', 'price', 'texture', 'wash', 'place']
    const emptyField = requiredField.find(field => !req.body[field])

    if (emptyField) {
        return res.status(400).json({ message: `Please fill in ${emptyField}` })
    }

    // Verify the category
    if(!validator.isIn(req.body.category.toLowerCase(), ['women', 'men', 'accessories'])) {
        return res.status(400).json({ message: 'Wrong category' })
    }

    req.body.category = req.body.category.toLowerCase()

    // Verify the title
    if (!validator.isLength(req.body.title, { max: 100 })) {
        return res.status(400).json({ message: 'The length of title should be lower than 100 characters' })
    }

    // Verify the description
    if (!validator.isLength(req.body.description, { max: 200 })) {
        return res.status(400).json({ message: 'The length of description should be lower than 200 characters' })
    }

    // Verify the texture
    if (!validator.isLength(req.body.texture, { max: 50 })) {
        return res.status(400).json({ message: 'The length of texture should be lower than 50 characters' })
    }
    
    // Verify the wash
    if (!validator.isLength(req.body.wash, { max: 50 })) {
        return res.status(400).json({ message: 'The length of wash should be lower than 50 characters' })
    }

    // Verify the price
    if (!validator.isInt(req.body.price, { min: 0 })) {
        return res.status(400).json({ message: 'Please enter a valid integer in the price field' })
    }

    // Verify the note
    if (req.body.note && !validator.isLength(req.body.note, { max: 100 })) {
        return res.status(400).json({ message: 'The length of note should be lower than 100 characters' })
    }
    
    // Verify the story
    const inputStory = req.body.story

    if (inputStory !== '') {
        if (!validator.isLength(inputStory, { max: 200 })) {
            return res.status(400).json({ message: 'The length of story should be lower than 200 words' })
        }
    }

    // Verify the variants when there is only one variant
    if (!Array.isArray(req.body.colorName)) {
        const requiredVariantFields = ['colorName', 'colorCode', 'size', 'stock']

        const transformVariantFieldName = {
            colorName: 'color name',
            colorCode: 'color code',
            size: 'size',
            stock: 'stock',
        }

        const emptyField = requiredVariantFields.find(field => !req.body[field])

        if (emptyField) {
            const errMessage = transformVariantFieldName[emptyField]
            return res.status(400).json({ message: `Please fill in ${errMessage}` })
        }

        const inputSizeToUpperCase = req.body.size.toUpperCase()
        const validateSize = ['XS', 'S', 'M', 'L', 'XL']

        if (!validator.isIn(inputSizeToUpperCase, validateSize)) {
            return res.status(400).json({ message: 'Wrong size' })
        }

        req.body.size = inputSizeToUpperCase
    }

    // Verify the variants when there are many set of variants
    const hasEmptyValue = (column) => {
        if (column.some(value => value === '')) {
            return true
        }}
    
    if (Array.isArray(req.body.colorName)) {
        if (hasEmptyValue(req.body.colorName)) {
            return res.status(400).json({ message: 'Please fill in color name' })
        } else if (hasEmptyValue(req.body.colorName)) {
            return res.status(400).json({ message: 'Please fill in color code' })
        } else if (hasEmptyValue(req.body.size)) {
            return res.status(400).json({ message: 'Please fill in size' })
        } else if (hasEmptyValue(req.body.stock)) {
            return res.status(400).json({ message: 'Please fill in stock' })
        }

        // Verify the size
        const validateSize = []

        req.body.size.forEach(size => {
            if (!validator.isIn(size.toUpperCase(), ['XS', 'S', 'M', 'L', 'XL'])) {
                return res.status(400).json({ message: 'Wrong size' })
            }
    
            validateSize.push(size.toUpperCase())
        })
    
        req.body.size = validateSize
    }

    if (!req.files['main-image']) {
        return res.status(400).json({message: `Please select one main image`})
    }

    next()
}