// Get element
const productSection = document.querySelector('#product-section')
const mainImgSection = document.querySelector('#main-img-section')
const mainImgContainer = document.querySelector('#main-img-container')
const mainImg = document.querySelector('#main-img')
const infoContainer = document.querySelector('#info-container')
const productTitle = document.querySelector('#product-title')
const productId = document.querySelector('#product-id')
const priceDiv = document.querySelector('#price')
const variantContainer = document.querySelector('#variant-container')
const variantList = document.querySelector('#variant-list')
const qty = document.querySelector('#qty-container')
const addCartBtn = document.querySelector('#add-cart-btn')
const detailsInfoContainer = document.querySelector('#details-info-container')
const note = document.querySelector('#note')
const texture = document.querySelector('#texture')
const wash = document.querySelector('#wash')
const place = document.querySelector('#place')
const divider = document.querySelector('#divider')
const otherImgSection = document.querySelector('#other-img-section')
const description = document.querySelector('#description')
const imgContainer = document.querySelector('#img-container')

let data

// Get product details from backend and show them on the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get query string
        const queryString = window.location.search
        const params = new URLSearchParams(queryString)
        const paramValue = params.get('id')

        // Get data from api
        const response = await axios.get(`/api/1.0/products/details?id=${paramValue}`)
        data = response.data.data
        
        // Main img section
        mainImg.src = data['main_image']
        mainImgContainer.appendChild(mainImg)

        productTitle.textContent = data.title
        productId.textContent = data.id
        priceDiv.textContent = `TWD. ${data.price}`

        data.variants.forEach((variant, index) => {
            // Create DOM elements for variant
            const variantDiv = document.createElement('div')
            const variantLabel = document.createElement('label')
            const variantInput = document.createElement('input')
            const colorBlock = document.createElement('div')
            const sizeBlock = document.createElement('div')

            // Set the attributes
            variantDiv.classList.add('variant')
            variantLabel.setAttribute('for', `variant${index}`)
            variantInput.setAttribute('type', 'radio')
            variantInput.setAttribute('name', 'variant-option')
            variantInput.setAttribute('value', index)
            variantInput.id = `variant${index}`
            colorBlock.classList.add('color-block')
            colorBlock.style.backgroundColor = variant['color_code']
            sizeBlock.classList.add('size-block')
            sizeBlock.textContent = variant.size

            variantLabel.appendChild(variantInput)
            variantLabel.appendChild(colorBlock)
            variantLabel.appendChild(sizeBlock)
            variantDiv.appendChild(variantLabel)
            variantList.appendChild(variantDiv)
        })

        note.textContent += data.note
        texture.textContent += data.texture
        wash.textContent += data.wash
        place.textContent += data.place
        detailsInfoContainer.appendChild(note)
        detailsInfoContainer.appendChild(texture)
        detailsInfoContainer.appendChild(wash)
        detailsInfoContainer.appendChild(place)

        infoContainer.appendChild(productTitle)
        infoContainer.appendChild(productId)
        infoContainer.appendChild(priceDiv)
        infoContainer.appendChild(variantContainer)
        infoContainer.appendChild(qty)
        infoContainer.appendChild(addCartBtn)
        infoContainer.appendChild(detailsInfoContainer)

        mainImgSection.appendChild(mainImgContainer)
        mainImgSection.appendChild(infoContainer)

        // other imgs section
        description.textContent = data.description

        data.images.forEach(img => {
            const image = document.createElement('img')
            image.src = img
            imgContainer.appendChild(image)
        })

        otherImgSection.appendChild(description)
        otherImgSection.appendChild(imgContainer)

        // product section
        productSection.appendChild(mainImgSection)
        productSection.appendChild(divider)
        productSection.appendChild(otherImgSection)
    } catch (err) {
        alert('Internal Server Error')
    }
})

// Add product to cart
addCartBtn.addEventListener('click', () => {
    try {
        // Check all of the fields has been filled in
        const isVariantFilled = document.querySelector('input[name="variant-option"]:checked')
        const qtyInput = document.querySelector('#input-qty').value

        if (!isVariantFilled) {
            return alert('請選擇一個樣式')
        }

        if (!qtyInput) {
            return alert('請填入購買數量')
        }

        const color = data.colors[isVariantFilled.value]
        const size = data.sizes[isVariantFilled.value]
        const qty = qtyInput

        // Summarize product detail for order
        const product = {
            id: data.id,
            name: data.title,
            price: data.price,
            color,
            size,
            qty,
            img: data['main_image']
        }
    
        // Store product in localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || []
        cart.push(product)
        localStorage.setItem('cart', JSON.stringify(cart))

        alert('Added the product to cart!')
    } catch (err) {
        alert('Internal Server Error')
    }
})