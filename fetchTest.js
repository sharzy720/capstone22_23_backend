const axios = require('axios')

// Make request
axios.get('http://localhost:3000/transactions/4')

    // Show response data
    .then(res => console.log(res.data))
    .catch(err => console.log(err))