const axios = require('axios');

process.env.PATH = 'C:\\msys64\\mingw64\\bin;' + process.env.PATH;
const API = 'http://localhost:5000/api';

(async () => {
  const email = `test.user.${Date.now()}@gmail.com`;
  const signup = await axios.post(`${API}/users/create`, {
    name: 'Test User',
    email,
    password: 'Test@1234!'
  });

  const login = await axios.post(`${API}/users/login`, {
    email,
    password: 'Test@1234!'
  });

  const token = login.data.token;
  const compile = await axios.post(`${API}/tools/devcpp/compile`, {
    source: '#include <iostream>\nint main(){ std::cout << "Hello"; return 0; }\n',
    filename: 'main.cpp'
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log(JSON.stringify({
    signup: signup.data.message,
    login: !!login.data.token,
    compile: compile.data
  }, null, 2));
})().catch((err) => {
  console.error('SWITCHERROR', err.response ? err.response.data : err.message);
  process.exit(1);
});
