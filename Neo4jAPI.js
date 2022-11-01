// import {getTransactions} from "./databaseConnection";
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
    }, 10);

})

// Working with user data



app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});