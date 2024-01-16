// Initialize FB SDK
window.fbAsyncInit = () => {
    FB.init({
        appId      : '675737601186456',
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
    })
        
    FB.AppEvents.logPageView()   
}

// Check FB login status
const statusChangeCallback = async (response) => {
    let accessToken;

    const handleLogin = async () => {
        if (accessToken) {
            try {
                const response = await axios.post('/api/1.0/user/signin', {
                    provider: 'facebook',
                    access_token: accessToken
                });

                // Store the access_token with cookie
                const now = new Date();
                const expires = new Date(now.getTime() + `${response.data.data.access_expired}` * 1000)
                document.cookie = `token=${encodeURIComponent(response.data.data.access_token)}; expires=${expires.toUTCString()};`

                alert('Sign in successfully');
                window.location.href = '/profile'
            } catch (err) {
                alert(`Error: ${err.response.data.message}`);
            }
        }
    };

    if (response.status === 'connected') {
        accessToken = response.authResponse.accessToken;
        handleLogin();
    }

    if (response.status === 'not_authorized' || response.status === 'unknown') {
        // login FB
        FB.login(async (loginResponse) => {
            if (loginResponse.status === 'connected') {
                accessToken = loginResponse.authResponse.accessToken;
                handleLogin();
            }
        }, { scope: 'public_profile,email' });
    }
};


const checkLoginState = () => {
    FB.getLoginStatus(response => {
        statusChangeCallback(response)
    })
}

const facebookLogOut = () => {
    FB.logout(response => {
        if (response.status === 'unknown') {
            alert('You logged out from facebook')
        } else {
            alert('Log out failed')
        }
    })
}

// Sign in with STYLiSH
const signInEmail = document.querySelector('#sign-in-email')
const signInPassword = document.querySelector('#sign-in-password')
const signInBtn = document.querySelector('#sign-in-btn')

signInBtn.addEventListener('click', async (event) => {
        event.preventDefault()

        const email = signInEmail.value
        const password = signInPassword.value
        signInEmail.value = ''
        signInPassword.value = ''
    
    try {
        const response = await axios.post('/api/1.0/user/signin', {
            provider: 'native',
            email,
            password
        })

        // Store the access_token with cookie
        const now = new Date();
        const expires = new Date(now.getTime() + `${response.data.data.access_expired}` * 1000)
        document.cookie = `token=${encodeURIComponent(response.data.data.access_token)}; expires=${expires.toUTCString()};`

        alert('Sign In Successfully')
        window.location.href = '/profile'
    } catch (err) {
        alert(`Failed: ${err.response.data.message}`)
    }
})

// Sign up
const signUpName = document.querySelector('#sign-up-name')
const signUpEmail = document.querySelector('#sign-up-email')
const signUpPassword = document.querySelector('#sign-up-password')
const signUpBtn = document.querySelector('#sign-up-btn')

signUpBtn.addEventListener('click', async (event) => {
    event.preventDefault()

    const name = signUpName.value
    const email = signUpEmail.value
    const password = signUpPassword.value

    signUpName.value = ''
    signUpEmail.value = ''
    signUpPassword.value = ''
    
    try {
        const response = await axios.post('/api/1.0/user/signup', {
            name,
            email,
            password
        })

        // Store the access_token with cookie
        const now = new Date();
        const expires = new Date(now.getTime() + `${response.data.data.access_expired}` * 1000)
        document.cookie = `token=${encodeURIComponent(response.data.data.access_token)}; expires=${expires.toUTCString()};`

        alert('Sign Up Successfully')
        // window.location.href = '/profile'
    } catch (err) {
        alert(err.response.data.message)
    }
})