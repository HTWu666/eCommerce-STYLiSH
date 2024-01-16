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

    try {
        if (!token) {
            window.location.href = '/user'
        }
        
        try {
            const response = await axios.get('/api/1.0/user/profile', {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            const data = response.data.data

            const welcome = document.querySelector('#welcome')
            const profileContainer = document.querySelector('#profile-container')
            const pictureContainer = document.createElement('div')
            const picture = document.createElement('img')

            pictureContainer.id = 'user-pic-container'
            picture.id = 'user-pic'
            
            welcome.textContent = `Hi ! ${data.name}`
            picture.src = data.picture

            pictureContainer.appendChild(picture)
            profileContainer.appendChild(pictureContainer)
        } catch (err) {
            if (err.response.status === 401 || err.response.status === 403) {
                window.location.href = '/user'
            } else {
                alert(err.response.data.message)
            }
        }
    } catch (err) {
        alert('Internal Server Error')
    }
})