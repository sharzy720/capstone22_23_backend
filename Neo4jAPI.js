const databaseConnection = require("./databaseConnection")
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
// const transactionFile = require('transactions.json')

app.use(express.json());

// Working with transaction data
app.post('/transactions/:timestep', async function (req, res) {
    const { timestep } = req.params;
    let transactions;

    // Call to either create transactions.json or return string of transactions json
    await databaseConnection.getTransactions(timestep).then(r =>
        console.log('databaseConnection promise = ' + r)
    );


    setTimeout(() => {
        // Reading json file and sending contents as response
        fs.readFile('./transactions.json', 'utf-8', (err, data) => {
            if (err) {
                throw err
            }

            transactions = JSON.parse(data.toString())

            console.log(transactions)

            // Send json objest as response to API request
            res.json(transactions)
        })
    }, 100);

})
app.post('/users/:timestep', async function (req, res) {
    const { timestep } = req.params;
    let users;
    // Call to either create the user.json file or to return a string of user.json.
    await databaseConnection.getUsers(timestep).then(r =>
        console.log('databaseConnection promise = ' + r)
    );

    setTimeout(() => {
        // Reading json file and sending contents as response
        fs.readFile('./users.json', 'utf-8', (err, data) => {
            if (err) {
                throw err
            }

            users = JSON.parse(data.toString())

            console.log(users)

            // Send json objest as response to API request
            res.json(users)
        })
    }, 100);

})





app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});