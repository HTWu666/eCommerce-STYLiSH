// Get the campaign details from the backend and show them on the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await axios.get('/api/1.0/marketing/campaigns')
        const data = response.data.data
        const firstCampaign = data[0]

        const campaignImg = document.querySelector('#campaign-img')
        const campaignCaption = document.querySelector('#campaign-caption')

        campaignImg.src = firstCampaign.picture
        campaignCaption.textContent = firstCampaign.story
    } catch (err) {
        alert('Internal Server Error')
    }
})

// Create the product cards
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const queryString = window.location.search
        const params = new URLSearchParams(queryString)
        let category = params.get('category')

        if (!category) {
            category = 'all'
        }

        const response = await axios.get(`/api/1.0/products/${category}`)
        const products = response.data.data

        const productSection = document.querySelector('#product-section')

        const productCardContainer = document.createElement('div')
        productCardContainer.classList.add('product-card-container')

        products.forEach(product => {
            const productCard = document.createElement('div')
            productCard.classList.add('product-card')

            const imgLink = document.createElement('a')
            imgLink.href = `/product?id=${product.id}`
            imgLink.classList.add('img-link')
            const img = document.createElement('img')
            img.src = product['main_image']
            imgLink.appendChild(img)

            const colorContainer = document.createElement('div')
            colorContainer.classList.add('color-container')
            product.variants.forEach(variant => {
                const colorBlock = document.createElement('div')
                colorBlock.classList.add('product-card-color-block')
                colorBlock.style.backgroundColor = variant['color_code']
                colorContainer.appendChild(colorBlock)
            })

            const titleLink = document.createElement('a')
            titleLink.href = `/product?id=${product.id}`
            // const title = document.createElement('div')
            titleLink.classList.add('product-card-title')
            titleLink.textContent = product.title

            const price = document.createElement('div')
            price.classList.add('product-card-price')
            price.textContent = `TWD. ${product.price}`

            productCard.appendChild(imgLink)
            productCard.appendChild(colorContainer)
            productCard.appendChild(titleLink)
            productCard.appendChild(price)

            productCardContainer.appendChild(productCard)
        })

        productSection.appendChild(productCardContainer)
    } catch (err) {
        alert('Internal Server Error')
    }
})