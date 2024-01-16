// Delete the first variant group
const deleteFirstVariantBtn = document.querySelector('#delete-first-variant-btn')
deleteFirstVariantBtn.addEventListener('click', (event) => {
    event.preventDefault()

    const variantGroup1 = document.querySelector('#variant-group1')

    variantGroupsContainer.removeChild(variantGroup1)
})

// Create a new variant set of size, color and stock
const variantGroupsContainer = document.getElementById('variants') // Container for all variant groups
const addVariantBtn = document.getElementById('add-variant-btn') // Add variant group btn

addVariantBtn.addEventListener('click', (event) => {
    event.preventDefault()

    // Container for a set of variants
    const variantGroup = document.createElement('div')
    variantGroup.classList.add('variant-group')
    variantGroup.classList.add('input-group')
    variantGroup.classList.add('mb-3')

    // Create color name input
    const colorNameContainer = document.createElement('div')
    const colorName = document.createElement('input')
    colorName.setAttribute('type', 'text')
    colorName.setAttribute('name', 'colorName')
    colorName.setAttribute('placeholder', 'Color Name')
    colorName.classList.add('form-control')
    colorNameContainer.classList.add('variant-input')
    colorNameContainer.appendChild(colorName)
    variantGroup.appendChild(colorNameContainer)

    // Create color code input
    const colorCodeContainer = document.createElement('div')
    const colorCode = document.createElement("input")
    colorCode.setAttribute("type", "color")
    colorCode.setAttribute("name", "colorCode")
    colorCode.classList.add('color-code-input')
    colorCodeContainer.classList.add('variant-input')
    colorCodeContainer.appendChild(colorCode)
    variantGroup.appendChild(colorCodeContainer)

    // Create size input
    const sizeSelectContainer = document.createElement("div")
    const sizeSelect = document.createElement("select")
    sizeSelect.setAttribute("name", "size")
    sizeSelect.classList.add("form-select")
    sizeSelectContainer.classList.add("variant-input")
    const sizes = ["XS", "S", "M", "L", "XL"]
    sizes.forEach(size => {
        const option = document.createElement("option")
        option.setAttribute("value", size)
        option.textContent = size
        sizeSelect.appendChild(option)
    })
    sizeSelectContainer.appendChild(sizeSelect)
    variantGroup.appendChild(sizeSelectContainer)

    // Create stock input
    const stockContainer = document.createElement("div")
    const stock = document.createElement("input")
    stock.setAttribute("type", "number")
    stock.setAttribute("name", "stock")
    stock.setAttribute("min", "0")
    stock.setAttribute("placeholder", "Stock")
    stock.setAttribute('class', 'form-control')
    stockContainer.classList.add("variant-input")
    stockContainer.appendChild(stock)
    variantGroup.appendChild(stockContainer)

    // Create the delete variant button
    const deleteBtnContainer = document.createElement("div")
    const deleteBtn = document.createElement("button")
    deleteBtn.setAttribute("type", "button")
    deleteBtn.setAttribute("class", "delete-variant-btn")
    deleteBtn.textContent = "Delete Variant"
    deleteBtnContainer.appendChild(deleteBtn)
    variantGroup.appendChild(deleteBtnContainer)

    // Append new variant set to variant groups container
    variantGroupsContainer.appendChild(variantGroup)
})

// Delete specific variant
variantGroupsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-variant-btn")) {
        event.preventDefault();

        const variantGroup = event.target.closest(".variant-group");
        if (variantGroup) {
            variantGroupsContainer.removeChild(variantGroup);
        }
    }
})

const form = document.getElementById('create-product-form')
const alertMessage = document.getElementById('alert-message')

form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    try {
        const response = await axios.post('/api/1.0/products', formData)

        if (response.status === 201) {
            alert('Create Successfully')
            window.location.href = '/admin/product'
        }
    } catch (err) {
        alert(`Failed: ${err.response.data.message}`)
    }
})