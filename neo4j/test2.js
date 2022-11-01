(async() => {
    const neo4j = require('neo4j-driver');                  // Neo4j driver for communicating with the database

    const uri = 'neo4j+s://d0a1241d.databases.neo4j.io';    // URL for database
    const user = 'neo4j';                                   // Username for database
    const password = 'WCUCapstone2022';                     // Password for database
    const timeStep = 4;                                     // Transaction time step to grab
    const fs = require('fs')                                // Filesystem to use when creating json files
    let userIDS = [];                                       // List of all user IDs in the time step
    let idFile;                                             // JSON file to write user IDs to
    let transactionFile;                                    // JSON file to write transaction IDs to

    // To learn more about the driver: https://neo4j.com/docs/javascript-manual/current/client-applications/#js-driver-driver-object
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password)); // Logging into and connecting to database

    try {
        idFile = fs.openSync('test_ids.json', 'w');         // Opening User ID JSON file
        transactionFile = fs.openSync('test.json', 'w');    // Opening transaction JSON file
        await receiveDatabaseData(driver);

        // await findPerson(driver, person2Name);
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        // Don't forget to close the driver connection when you're finished with it.
        await driver.close();
    }


    /**
     * Receives transaction ids from given time step, parses transaction json
     * @param driver neo4j driver for running a query
     * @returns {Promise<void>}
     */
    async function receiveDatabaseData(driver) {

        const session = driver.session({ database: 'neo4j' });  // Create database session

        try {
            // Query to run on the connected database
            // const readQuery = 'MATCH p = (S:source)-[* {\`time step\`:' + timeStep + '}]-(T:target) RETURN S.name, T.name LIMIT 2';
            const readQuery = 'MATCH p = (S:source)-[* {\`time step\`:2}]-(T:target) RETURN S.name as source, T.name as target LIMIT 2';

            const readResult = await session.readTransaction(tx =>
                tx.run(readQuery)
            );  // Result received from the database

            // let testJson = JSON.parse(readResult)

            // console.log("Is readResult a json object: " + JSON.stringify(testJson));

            // Create json file of transactions (source, target)
            writeToFile(transactionFile, "[\n")

            for await (const [index, record] of readResult.records.entries()) {
                // console.log(`Source ID: ${record.get('S.name')} ----> Target ID: ${record.get('T.name')}`)

                let sourceID = record.get('S.name');    // ID of source user
                let targetID = record.get('T.name');    // ID of target user

                if (index === readResult.records.length - 1) {
                    // Do not include a comma if the transaction is the last in the list

                    getUserIds(sourceID, targetID)
                    // Appends source and target ids to the transaction json file
                    appendToFile(transactionFile, "{ \"source\": " + sourceID + ", \"target\": " + targetID + " }\n")

                } else {
                    getUserIds(sourceID, targetID)
                    // Appends source and target ids to the transaction json file
                    appendToFile(transactionFile, "{ \"source\": " + sourceID + ", \"target\": " + targetID + " },\n")
                }
            }

            // Timeout so closing bracket is written to end of json and not the middle
            setTimeout(() => {  appendToFile(transactionFile, "]"); }, 0);
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }

        await createUserIdJson(userIDS)
    }


    /**
     * Creates a json file for all unique user ids that had transactions
     * @param ids List of user ids
     * @returns {Promise<void>}
     */
    async function createUserIdJson(ids) {
        // Remove duplicate user ids

        // Different ways to remove duplicate IDS choose one
        // userIDS = [...new Set(userIDS)];
        // let filteredUserIds = ids.reduce((p, c) => p.set(c.a, c), new Map()).values()
        // let filteredUserIds = [...new Set(ids)]
        // let filteredUserIds = ids.filter((element, index) => {
        //     return ids.indexOf(element) === index;
        // });
        let filteredUserIds = []    // List of user IDs without duplicate IDs
        ids.forEach((id) => {
            if (!filteredUserIds.includes(id)) {
                filteredUserIds.push(id);
            }
        });


        // Create json of user ids (name)
        writeToFile(idFile, "[\n")

        for await (const [index, id] of filteredUserIds.entries()) {

            if (index === filteredUserIds.length - 1) {
                // Do not include a comma if the id is that last id in the list
                appendToFile(idFile, "{ \"name\": " + id + " }\n");
            } else {
                appendToFile(idFile, "{ \"name\": " + id + " },\n");
            }
        }

        // Timeout so closing bracket is written to end of json and not the middle
        setTimeout(() => {  appendToFile(idFile, "]"); }, 0);
    }


    /**
     * Pushes the given source and target IDs to the user list
     * @param source Source user ID
     * @param target Target user ID
     */
    function getUserIds(source, target) {
        // Recording all user ids that were either the source or target of a transaction
        userIDS.push(source.toString());

        userIDS.push(target.toString());
    }


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

})();
