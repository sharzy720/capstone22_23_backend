const neo4j = require('neo4j-driver');                  // Neo4j driver for communicating with the database
const uri = 'neo4j+s://d0a1241d.databases.neo4j.io';    // URL for database
const user = 'neo4j';                                   // Username for database
const password = 'WCUCapstone2022';                     // Password for database
const fs = require('fs')                                // Filesystem to use when creating json files
let userFile;                                             // JSON file to write user IDs to
let transactionFile;                                    // JSON file to write transaction IDs to

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password)); // Logging into and connecting to database



module.exports.getTransactions = async function(timestep) {
    const json = ""
    const session = driver.session({ database: 'neo4j' });  // Create database session
    transactionFile = fs.openSync('transactions.json', 'w');    // Opening transaction JSON file

    try {
        // Query to run on the connected database
        const readQuery = 'MATCH p = (S:source)-[* {\`time step\`:' + timestep.toString() + '}]-(T:target) RETURN S.name, T.name LIMIT 2';
        // const readQuery = 'MATCH p = (S:source)-[* {\`time step\`:2}]-(T:target) RETURN S.name as source, T.name as target LIMIT 2';

        const readResult = await session.readTransaction(tx =>
            tx.run(readQuery)
        );  // Result received from the database

        // let testJson = JSON.parse(readResult)

        // console.log("Is readResult a json object: " + JSON.stringify(testJson));

        // Create json file of transactions (source, target)
        writeToFile(transactionFile, "[\n")
        json.concat("[")
        // console.log("[\n")

        for await (const [index, record] of readResult.records.entries()) {
            // console.log(`Source ID: ${record.get('S.name')} ----> Target ID: ${record.get('T.name')}`)

            let sourceID = record.get('source');    // ID of source user
            let targetID = record.get('target');    // ID of target user

            if (index === readResult.records.length - 1) {
                // Do not include a comma if the transaction is the last in the list

                // Appends source and target ids to the transaction json file
                appendToFile(transactionFile, "{ \"source\": " + sourceID + ", \"target\": " + targetID + " }\n")
                json.concat("{ \"source\": " + sourceID + ", \"target\": " + targetID + " }")
                // console.log("{ \"source\": " + sourceID + ", \"target\": " + targetID + " }\n")

            } else {
                // Appends source and target ids to the transaction json file
                appendToFile(transactionFile, "{ \"source\": " + sourceID + ", \"target\": " + targetID + " },\n")
                json.concat("{ \"source\": " + sourceID + ", \"target\": " + targetID + " },")
                // console.log("{ \"source\": " + sourceID + ", \"target\": " + targetID + " },\n")
            }
        }

        // Timeout so closing bracket is written to end of json and not the middle
        setTimeout(() => {  appendToFile(transactionFile, "]"); }, 0);
        // appendToFile(transactionFile, "]");
        json.concat("]")
        // console.log("]")
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await session.close();
    }
    console.log(json)
    // return JSON.parse(transactionFile)
    // return json
}

// module.exports.getUsers = async function(timestep) {
//     const session = driver.session({ database: 'neo4j' });  // Create database session
//     userFile = fs.openSync('test_ids.json', 'w');         // Opening User ID JSON file
//
//
// }

/**
 * Overwrites a given file with the given message
 * @param file File to overwrite
 * @param message String to overwrite file with
 */
function writeToFile(file, message) {
    fs.writeFile(file, message, (err) => {
        if (err) throw err;
        else{
            // console.log(file + ' has been reset with ' + message)
        }
    })
}


/**
 * Appends a given file with the given message
 * @param file File to append a String to
 * @param message String to append to a file
 */
function appendToFile(file, message) {
    fs.appendFile(file, message, function (err) {
        if (err) throw err;
        // console.log('Appended ' + message + ' to ' + file);
    });
}

// export {getTransactions};
// module.exports.getTransaction = getTransaction;