const databaseConnection = require("./databaseConnection")
const express = require('express');
const fs = require('fs');
const app = express();

const PORT = 4000;  // Port to run the backend on

// Allows for the API to work with JSON objects natively
app.use(express.json());


// Getting all transactions of a given time step
app.get('/transactions/:timestep', async function (req, res) {
    const { timestep } = req.params;    // What time step of transactions to retrieve from the database
    let transactions;                   // Retrieved transactions from the database

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

            // Getting transactions from the database
            transactions = JSON.parse(data.toString())

            console.log(transactions)

            // Send json object as response to API request
            res.json(transactions)
        })
    }, 100);

})


// Getting all users of a given time step
app.get('/users/:timestep', async function (req, res) {
    const { timestep } = req.params;    // What time step of users to retrieve from the database
    let users;                          // Retrieved users from the database

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

            // Getting users from the database
            users = JSON.parse(data.toString())

            console.log(users)

            // Send json object as response to API request
            res.json(users)
        })
    }, 100);

})

// API listening on the given port for incoming requests
app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});