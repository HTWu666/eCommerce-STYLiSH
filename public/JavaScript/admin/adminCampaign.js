const form = document.getElementById('create-campaign-form')

form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)

    try {
        const response = await axios.post('/api/1.0/marketing/campaigns', formData)
        
        if (response.status === 201) {
            alert('Create Successfully')
            window.location.href = '/admin/campaign'
        }
    } catch (err) {
        alert(`Failed: ${err.response.data.message}`)
    }
})