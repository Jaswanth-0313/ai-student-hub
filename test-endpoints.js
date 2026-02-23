const axios = require('axios')

const API = process.env.API_BASE || 'http://localhost:5000/api'

async function run() {
  try {
    console.log('Testing API endpoints...')
    // 1) Create a temporary test user (unique email)
    const testEmail = `test.user.${Date.now()}@gmail.com`
    const signup = await axios.post(`${API}/users/create`, {
      name: 'Test User',
      email: testEmail,
      password: 'Test@1234!'
    }).catch(e => e.response ? e.response.data : e)
    console.log('Signup:', signup.data || signup)

    // 2) Login
    const login = await axios.post(`${API}/users/login`, { email: testEmail, password: 'Test@1234!' })
    console.log('Login:', login.data && login.data.token ? 'OK' : login.data)
    const token = login.data.token

    // 3) Call Dev-C++ compile endpoint with a simple program
    const compile = await axios.post(`${API}/tools/devcpp/compile`, {
      source: '#include <iostream>\nint main(){ std::cout<<"Hello from test"; return 0; }',
      filename: 'main.cpp'
    }, { headers: { Authorization: `Bearer ${token}` } })

    console.log('Compile response:', compile.data)

    console.log('All tests finished')
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message)
    process.exit(1)
  }
}

run()
