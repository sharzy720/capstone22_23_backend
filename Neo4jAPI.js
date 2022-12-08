/**
 * @file API that retrieves transactions and users from a Neo4j database
 * @author Johnathyn Strong and Nickolas Wofford
 */

/**
 * Functions to make queries on the Neo4j database
 * @type {{getTransactions?: function(number=, number=): Promise<void>, getUsers?: function(number=, number=): Promise<void>}}
 */
const databaseConnection = require("./databaseConnection")

/**
 * Gets Express.js functions
 * @type {e | (() => Express)}
 */
const express = require('express');

/** Filesystem to use when creating json files */
const fs = require('fs');

/**
 * Sets up Express to be used in the API
 * @type {Express}
 */
const app = express();

/**
 * Port to run API on
 * @type {number}
 */
const PORT = 4000;


app.use(express.json());


/**
 * API listening on the given port for incoming requests
 */
app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});


/**
 * Getting all transactions of a given time step
 *
 * Path:
 *      /transactions/{timestep}/{limit}
 *          get:
 *              summary: Get transactions by timestep and limit
 *              parameters:
 *                  - in: path
 *                    name: timestep
 *                    schema:
 *                      type: integer
 *                      required: true
 *                      description: Numeric ID of a timestep in the database
 *                  - in: path
 *                    name: limit
 *                    schema:
 *                      type: integer
 *                      required: true
 *                      description: Number of transactions to retrieve from database
 *              responses:
 *                  '200':
 *                      Description: A JSON object with the source and target id's of requested transactions
 *                      content:
 *                          application/json:
 *                              schema:
 *                                  type: object
 *                                  properties:
 *                                      source:
 *                                          type: String
 *                                          example: 312490865
 *                                      target:
 *                                          type: String
 *                                          example: 312490873
 */
app.get('/transactions/:timestep/:limit', async function (req, res) {
    // /** @const {String} */
    const { timestep } = req.params;
    // /** @const {} */
    const { limit } = req.params;
    // /** @type {} */
    let transactions;

    // Call to either create transactions.json or return string of transactions json
    await databaseConnection.getTransactions(timestep, limit).then(r =>
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
            console.log(timestep)
            console.log(transactions)

            // Send json object as response to API request
            res.json(transactions)
        })
    }, 100);
})


/**
 * Getting all users of a given time step
 *
 * Path:
 *      /users/{timestep}/{limit}
 *          get:
 *              summary: Get user ID's by timestep and limit
 *              parameters:
 *                  - in: path
 *                    name: timestep
 *                    schema:
 *                      type: integer
 *                      required: true
 *                      description: Numeric ID of a timestep in the database
 *                  - in: path
 *                    name: limit
 *                    schema:
 *                      type: integer
 *                      required: true
 *                      description: Number of users to retrieve from database
 *              responses:
 *                  '200':
 *                      Description: A JSON object with the id's of requested users
 *                      content:
 *                          application/json:
 *                              schema:
 *                                  type: object
 *                                  properties:
 *                                      name:
 *                                          type: String
 *                                          example: 312490865
 */
app.get('/users/:timestep/:limit', async function (req, res) {
    const { timestep } = req.params;
    const { limit } = req.params;
    let users;

    // Call to either create the user.json file or to return a string of user.json.
    await databaseConnection.getUsers(timestep, limit).then(r =>
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