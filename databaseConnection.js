/**
 * @file Connects to a Neo4j database and runs queries on it
 * @author Johnathyn Strong and Nickolas Wofford
 */

/** Neo4j driver for communicating with the database */
const neo4j = require('neo4j-driver');

/**
 * URL for database
 * @type {string}
 */
const uri = 'neo4j+s://d0a1241d.databases.neo4j.io';

/**
 * Username for database
 * @type {string}
 */
const user = 'neo4j';

/**
 * Password for database
 * @type {string}
 */
const password = 'WCUCapstone2022';

/** Filesystem to use when creating json files */
const fs = require('fs')

/** Logging into and connecting to the Neo4j database */
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));


/**
 * Connects to neo4j database and returns all transactions of a given timestep
 *
 * @param {number} timestep Transactions timestep to return, DEFAULT: 1
 * @param {number} limit Number of transactions to return, DEFAULT: 1000
 *
 * @returns {Promise<void>}
 */
module.exports.getTransactions = async function(timestep=1, limit=20) {
    console.log('====start of getTransactions====')

    /**
     * Create database session
     * @type {Session}
     */
    const session = driver.session({ database: 'neo4j' });

    /**
     * JSON file to write transaction IDs to
     * @type {number}
     */
    let transactionFile = fs.openSync('transactions.json', 'w');

    try {
        /**
         * Transaction query to run on the database
         * @type {string}
         */
        const readQuery = 'MATCH p = (S:source)-[* {\`time step\`:' + timestep + '}]-(T:target) RETURN S.name as source, T.name as target LIMIT ' + limit;

        /**
         * Result received from the database
         * @type {QueryResult<Dict>}
         */
        const readResult = await session.readTransaction(tx =>
            tx.run(readQuery)
        );

        // Create json file of transactions (source, target)
        createTransactionFile(transactionFile, readResult)

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
    console.log('====end of getTransactions====')
}


/**
 * Connects to neo4j database and returns all unique users of time transactions in a given timestep
 *
 * @param {number} timestep Transactions timestep to return users from, DEFAULT: 1
 * @param {number} limit Number of transactions to return, DEFAULT: 1000
 *
 * @returns {Promise<void>}
 */
module.exports.getUsers = async function(timestep=1, limit=20) {
    console.log('====start of getUsers====')

    /**
     * Create database session
     * @type {Session}
     */
    const session = driver.session({ database: 'neo4j' });

    /**
     * JSON file to write user IDs to
     * @type {number}
     */
    let userFile = fs.openSync('users.json', 'w');

    try {
        /**
         * User query to run on the database
         * @type {string}
         */
        // const readQuery = 'MATCH p = (S:source)-[* {\`time step\`:' + timestep + '}]-(T:target) RETURN S.name as name LIMIT ' + limit + ' UNION MATCH p = (S:source)-[* {\`time step\`:' + timestep + '}]-(T:target) RETURN T.name as name LIMIT ' + limit;
        //const readQuery = 'MATCH p = (S:source)-[* {\`time step\`:' + timestep + '}]-(T:target) RETURN S.name as name, S.class as class LIMIT ' + limit + ' UNION MATCH p = (S:source)-[* {\`time step\`:' + timestep + '}]-(T:target) RETURN T.name as name, S.class as class LIMIT ' + limit;
        const readQuery = 'MATCH p = (S:source)-[* {\`time step\`:' + timestep + '}]-(T:target) RETURN S.name as name, S.class as class LIMIT ' + limit + ' UNION MATCH p = (S:source)-[* {\`time step\`:' + timestep + '}]-(T:target) RETURN T.name as name, S.class as class LIMIT ' + limit;

        // MATCH p = (S:source)-[* {`time step`:1}]-(T:target) RETURN S.name as name, S.class as class LIMIT 100 UNION MATCH p = (S:source)-[* {`time step`:1}]-(T:target) RETURN T.name as name, S.class as class LIMIT 100

        /**
         * Result received from the database
         * @type {QueryResult<Dict>}
         */
        const readResult = await session.readTransaction(tx =>
            tx.run(readQuery)
        );

        console.log("readResult = " + readResult)

        // Create json file of users (name)
        createUserFile(userFile, readResult);

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
    console.log('====end of getUsers====')
}


/**
 * Translates the received Neo4j transaction JSON object into a JSON object readable by D3.js
 *
 * @param {number} transactionFile The output file for the created transaction JSON file
 * @param {QueryResult<Dict>} readResult The results received from the database query
 */
function createTransactionFile(transactionFile, readResult) {
    writeToFile(transactionFile, "[\n")

    console.log("[")

    for (const [index, record] of readResult.records.entries()) {
        // console.log(`Source ID: ${record.get('S.name')} ----> Target ID: ${record.get('T.name')}`)

        /**
         * ID of source user
         * @type {RecordShape["source"]}
         */
        let sourceID = record.get('source');

        /**
         * ID of target user
         * @type {RecordShape["target"]}
         */
        let targetID = record.get('target');

        if (index === (readResult.records.length - 1)) {
            // Do not include a comma if the transaction is the last in the list

            // Appends source and target ids to the transaction json file
            appendToFile(transactionFile, "{ \"source\": " + sourceID + ", \"target\": " + targetID + " }\n")

            console.log("{ \"source\": " + sourceID + ", \"target\": " + targetID + " }")

        } else {
            // Appends source and target ids to the transaction json file
            appendToFile(transactionFile, "{ \"source\": " + sourceID + ", \"target\": " + targetID + " },\n")

            console.log("{ \"source\": " + sourceID + ", \"target\": " + targetID + " },")
        }
    }

    // Timeout so closing bracket is written to end of json and not the middle
    setTimeout(() => {  appendToFile(transactionFile, "]"); }, 0);

    console.log("]")
}


/**
 * Translates the received Neo4j user JSON object into a JSON object readable by D3.js
 *
 * @param {number} userFile The output file for the created user JSON file
 * @param {QueryResult<Dict>} readResult The results received from the database query
 */
function createUserFile(userFile, readResult) {
    writeToFile(userFile, "[\n")


    const nodeList = [];
    console.log("[")

    for (const [index, record] of readResult.records.entries()) {
        // console.log(`Source ID: ${record.get('S.name')} ----> Target ID: ${record.get('T.name')}`)

        /**
         * ID of a user
         * @type {RecordShape["name"]}
         */
        let userId = record.get('name');

        let userClass = record.get('class')

        if (!nodeList.hasOwnProperty("" + userId)) {
            nodeList["" + userId] = userClass;
            if (index != 0) {
                appendToFile(userFile, ",\n{ \"name\": " + userId + ", \"class\": \"" + userClass + "\" }");
            }
            else {
                appendToFile(userFile, "{ \"name\": " + userId + ", \"class\": \"" + userClass + "\" }")
            }

            console.log("{ \"name\": " + userId + " }\n")
        }

        /*
        if (index === (readResult.records.length - 1)) {
            // Do not include a comma if the transaction is the last in the list

            // Appends source and target ids to the transaction json file
            // appendToFile(userFile, "{ \"name\": " + userId + " }\n")
            appendToFile(userFile, "{ \"name\": " + userId + ", \"class\": \"" + userClass + "\" }\n")

            console.log("{ \"name\": " + userId + " }\n")

        } else {
            // Appends source and target ids to the transaction json file
            // appendToFile(userFile, "{ \"name\": " + userId + " },\n")
            appendToFile(userFile, "{ \"name\": " + userId + ", \"class\": \"" + userClass + "\" },\n")

            console.log("{ \"name\": " + userId + " },\n")
        }*/
    }

    // Timeout so closing bracket is written to end of json and not the middle
    setTimeout(() => {  appendToFile(userFile, "]"); }, 0);

    console.log("]")
}


/**
 * Overwrites a given file with the given message
 *
 * @param {number} file File to overwrite
 * @param {String} message String to overwrite file with
 */
function writeToFile(file, message) {
    fs.writeFile(file, message, (err) => {
        if (err) throw err;
    })
}


/**
 * Appends a given file with the given message
 *
 * @param {number} file File to append a String to
 * @param {String} message String to append to a file
 */
function appendToFile(file, message) {
    fs.appendFile(file, message, function (err) {
        if (err) throw err;
    });
}