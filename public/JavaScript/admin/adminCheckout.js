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

const onSubmit = (event) => {
    event.preventDefault()

    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    if (tappayStatus.canGetPrime === false) {
        alert('can not get prime')
        return
    }

    // Get prime
    TPDirect.card.getPrime(async (result) => {
        try {
            if (result.status !== 0) {
                alert('get prime error ' + result.msg)
                return
            }
            alert('get prime 成功\nprime: ' + result.card.prime)

            const prime = result.card.prime

            
                const cookies = document.cookie.split('; ')
                
                let token

                for (const cookie of cookies) {
                    const [name, value] = cookie.split('=')
                    if (name === 'token') {
                        token = value
                        break
                    }
                }
            
            try {
                const response = await axios.post('/order/checkout', {
                    "prime": `${prime}`,
                    "order": {
                        "shipping": "delivery",
                        "payment": "credit_card",
                        "subtotal": 1234,
                        "freight": 14,
                        "total": 1300,
                        "recipient": {
                        "name": "Luke",
                        "phone": "0987654321",
                        "email": "luke@gmail.com",
                        "address": "市政府站",
                        "time": "morning"
                        },
                        "list": [
                            {
                                "id": "19",
                                "name": "活力花紋長筒牛仔褲",
                                "price": 1299,
                                "color": {
                                    "code": "#65bfe6",
                                    "name": "淺藍"
                                },
                                "size": "M",
                                "qty": 1
                            },
                            {
                                "id": "19",
                                "name": "活力花紋長筒牛仔褲",
                                "price": 1299,
                                "color": {
                                    "code": "#000000",
                                    "name": "黑"
                                },
                                "size": "XS",
                                "qty": 1
                            }
                        ]
                    }
                    }, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    }
                )
                console.log(response.data)
                alert(`Successful! Your order id is ${response.data.data.number}`)
            } catch (err) {
                alert(`Failed: ${err.response.data.message}`);
            }
        } catch (err) {
            alert(err)
        }
    })
}