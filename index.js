// const express = require('express')();
// const app = express();
// const PORT = 8080;
//
// app.use( express.json() )
//
// // needed to start the server and have it listening on a given port
// app.listen(
//     PORT,
//     () => console.log(`it's alive on http://localhost:${PORT}`)
// )
//
// // Needed to handle get requests
// // req - incoming data
// // res - data to send out
// app.get(`/tshirt`, (req, res) => {
//     res.status(200).send({
//         tshirt: 'shirt',
//         size: 'large'
//     })
// });
//
// app.post('/tshirt/:id', (req, res) => {
//     const { id } = req.params;
//     const { logo } = req.body;
//
//     if (!logo) {
//         res.status(418).send({ message: 'We need a logo!' })
//     }
//
//     res.send({
//         tshirt: `tshirt with your ${logo} and ID of ${id}`,
//     })
// })

// The below code was writting using a combination of the video and this link
// https://www.geeksforgeeks.org/express-js-express-json-function/

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/:id', function (req, res) {
    // console.log(req.body.name)
    // res.end();
    const { id } = req.params;
    const { logo } = req.body;

    if (!logo) {
        res.status(418).send({ message: 'We need a logo!' })
    }

    res.send({
        tshirt: `tshirt with your ${logo} and ID of ${id}`,
    })
})

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});