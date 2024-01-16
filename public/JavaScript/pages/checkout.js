const productList = document.querySelector('#product-list')

document.addEventListener('DOMContentLoaded', async () => {
    const cookies = document.cookie.split('; ')
    let token

    for (const cookie of cookies) {
        const [name, value] = cookie.split('=')
        if (name === 'token') {
            token = value
            break
        }
    }

    if (!token) {
        window.location.href = '/user'
    }

    // Show the products in cart on the page
    const products = JSON.parse(localStorage.getItem('cart'))
    
    if (!products || products.length !== 0) {
        products.forEach((product, index) => {
            const productContainer = document.createElement('div')
            const imgLink = document.createElement('a')
            const image = document.createElement('img')
            const productInfo = document.createElement('div')
            const id = document.createElement('div')
            const nameLink = document.createElement('a')
            const price = document.createElement('div')
            const color = document.createElement('div')
            const size = document.createElement('div')
            const qty = document.createElement('div')
            const subtotal = document.createElement('div')
            const deleteBtn = document.createElement('img')

            productContainer.classList.add('product-container')
            image.classList.add('image')
            productInfo.classList.add('product-info')
            id.classList.add('id')
            nameLink.classList.add('name')
            price.classList.add('price')
            color.classList.add('color')
            size.classList.add('size')
            qty.classList.add('qty')
            subtotal.classList.add('product-subtotal')
            deleteBtn.classList.add('delete-product-btn')

            imgLink.href = `/product?id=${product.id}`
            nameLink.href = `/product?id=${product.id}`

            image.src = product.img
            id.textContent = product.id
            nameLink.textContent = product.name
            price.textContent = `單價 TWD. ${product.price}`
            color.textContent = `顏色 | ${product.color.name}`
            size.textContent = `尺寸 | ${product.size}`
            qty.textContent = `數量 ${product.qty}`
            subtotal.textContent = `小計 TWD. ${product.price * product.qty}`
            deleteBtn.src = '/icons/cart-remove.png'
            deleteBtn.setAttribute('data-product-index', `${index}`)

            imgLink.appendChild(image)
            productInfo.appendChild(nameLink)
            productInfo.appendChild(id)
            productInfo.appendChild(color)
            productInfo.appendChild(size)
            productContainer.appendChild(imgLink)
            productContainer.appendChild(productInfo)
            productContainer.appendChild(qty)
            productContainer.appendChild(price)
            productContainer.appendChild(subtotal)
            productContainer.appendChild(deleteBtn)

            productList.appendChild(productContainer)

            // Show the checkout amount on the page
            showCheckoutAmount()
        })
    } else {
        productList.textContent = '目前購物車是空的'
        productList.style.fontSize = '30px'
    }

    // Create event listener for the all of the product delete btn
const deleteProductBtns = document.querySelectorAll('.delete-product-btn')

deleteProductBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const productIndex = parseInt(btn.getAttribute('data-product-index'))

        // Delete the specific product from the cart
        const cart = JSON.parse(localStorage.getItem('cart'))
        cart.splice(productIndex, 1)

        // Update the localStorage
        localStorage.setItem('cart', JSON.stringify(cart))

        // Refresh the page to show the latest cart status
        location.reload() 
        })
    })
})

// Card field setup
TPDirect.setupSDK('12348', 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox')

TPDirect.card.setup({
    fields: {
        number: {
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'ccv'
        }
    },

    styles: {
        'input': {
            'color': 'gray'
        },
        'input.ccv': {
            'font-size': '16px'
        },
        'input.expiration-date': {
            'font-size': '16px'
        },
        'input.card-number': {
            'font-size': '16px'
        },
        ':focus': {
            'color': 'black'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
})

// Calculate the checkout amount
const getCheckoutAmount = () => {
    // Get the products in cart
    const productsInCart = localStorage.getItem('cart')
    const products = JSON.parse(productsInCart)

    // Calculate the checkout amount
    let subtotal = 0
    let freight = 100

    products.forEach(product => {
        subtotal += product.price
    })

    let total = subtotal + freight

    return {
        subtotal,
        freight,
        total
    }
}

// Show the checkout amount on the page
const showCheckoutAmount = () => {
    const {subtotal, freight, total} = getCheckoutAmount()

    const subtotalDiv = document.querySelector('#subtotal')
    const freightDiv = document.querySelector('#freight')
    const totalDiv = document.querySelector('#total')

    subtotalDiv.textContent = `NT. ${subtotal}`
    freightDiv.textContent = `NT. ${freight}`
    totalDiv.textContent = `NT. ${total}`
}

// Execute the checkout process
const checkoutBtn = document.querySelector('#checkout-btn')

checkoutBtn.addEventListener('click', async () => {
    const recipientName = document.querySelector('#recipient-name').value
    const recipientPhone = document.querySelector('#recipient-phone').value
    const recipientAddress = document.querySelector('#recipient-address').value
    const recipientEmail = document.querySelector('#recipient-email').value
    const deliveryTime = document.querySelector('#delivery-time').value

    // Check all of the fields has been filled in
    if (!recipientName) {
        return alert('請填寫收件人姓名')
    }

    if (!recipientPhone) {
        return alert('請填寫手機')
    }

    if (!recipientAddress) {
        return alert('請填寫地址')
    }

    if (!recipientEmail) {
        return alert('請填寫 Email')
    }

    if (!deliveryTime) {
        return alert('請選擇配送時間')
    }

    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    if (tappayStatus.canGetPrime === false) {
        return alert('請填寫付款資訊')
    }

    // Get prime from tap pay and send the checkout request to the backend
    let prime

    TPDirect.card.getPrime(async (result) => {
        // Get prime from tap pay
        if (result.status !== 0) {
            alert('get prime error ' + result.msg)
            return
        }
        // alert('get prime 成功\nprime: ' + result.card.prime)

        prime = result.card.prime

        // Get the checkout amount
        const { subtotal, freight, total } = getCheckoutAmount()

        // Get the recipient info
        const recipientName = document.querySelector('#recipient-name').value
        const recipientPhone = document.querySelector('#recipient-phone').value
        const recipientAddress = document.querySelector('#recipient-address').value
        const recipientEmail = document.querySelector('#recipient-email').value
        const deliveryTime = document.querySelector('#delivery-time').value

        // Get the products in cart
        const productList = JSON.parse(localStorage.getItem('cart'))

        // Get the token from cookies
        const cookies = document.cookie.split('; ')
        let token

        for (const cookie of cookies) {
            const [name, value] = cookie.split('=')
            if (name === 'token') {
                token = value
                break
            }
        }

        // Send the checkout request to the backend
        try {
            const response = await axios.post('/api/1.0/order/checkout', {
                "prime": prime,
                "order": {
                    "shipping": "delivery",
                    "payment": "credit_card",
                    "subtotal": subtotal,
                    "freight": freight,
                    "total": total,
                    "recipient": {
                    "name": recipientName,
                    "phone": recipientPhone,
                    "email": recipientEmail,
                    "address": recipientAddress,
                    "time": deliveryTime
                    },
                    "list": productList
                }
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
            
            alert(`Successful! Your order id is ${response.data.data.number}`)
            localStorage.setItem('cart', JSON.stringify([]))
            window.location.href = '/thankyou'
        } catch (err) {
            alert(`Failed: ${err.response.data.message}`);
        }
    })
})