    // import React from 'react'
    // import DetailsPanel from "../components/DetailsPanel";

    const neo4j = require('neo4j-driver');                  // Neo4j driver for communicating with the database

    const uri = 'neo4j+s://d0a1241d.databases.neo4j.io';    // URL for database
    const user = 'neo4j';                                   // Username for database
    const password = 'WCUCapstone2022';                     // Password for database
    const timeStep = 1;                                     // Transaction time step to grab
    let userIDS = [];                                       // List of all user IDs in the time step
    let transactionJson = "\"links\":";
    let userJson = "\"nodes\":";
    let completeJson = "{"

    // createJsonFiles().then(r => {console.log("this is r: " + r)});

    // console.log(JSON.stringify({
    //     nodes: [
    //         { name: "Alice" },
    //         { name: "Bob" }
    //     ],
    //     links: [
    //         { source: "Alice", target: "Bob" }
    //     ]
    // }))
// createCompleteJson();

    // export default function createCompleteJson() {
    //     createJsonFiles().then(r => {console.log("createCompleteJson is running")});
    //     completeJson += transactionJson;
    //     completeJson += ","
    //     completeJson += userJson;
    //     completeJson += "}"
    // // console.log(completeJson)
    // //     setTimeout(() => {  return completeJson; }, 0);
    //     return completeJson;
    // }

    export default async function createJsonFiles() {
        // To learn more about the driver: https://neo4j.com/docs/javascript-manual/current/client-applications/#js-driver-driver-object
        const driver = neo4j.driver(uri, neo4j.auth.basic(user, password)); // Logging into and connecting to database

        try {
            // console.log("this is a test")
            await receiveDatabaseData(driver)

            // console.log(transactionJson);
            // console.log("\n" + userJson);
            completeJson += transactionJson;
            completeJson += ","
            completeJson += userJson;
            completeJson += "}"

            console.log("COMPLETE JSON STRING: " + completeJson)

            // await findPerson(driver, person2Name);
        } catch (error) {
            console.error(`createJsonFiles ERROR: ${error}`);
        } finally {
            // Don't forget to close the driver connection when you're finished with it.
            await driver.close();
        }

        return completeJson;
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
            const readQuery = 'MATCH p = (S:source)-[* {\`time step\`:' + timeStep + '}]-(T:target) RETURN S.name, T.name LIMIT 2';

            const readResult = await session.readTransaction(tx =>
                tx.run(readQuery)
            );  // Result received from the database


            // Create json file of transactions (source, target)
            appendToTransactionJson("[")

            for await (const [index, record] of readResult.records.entries()) {
                // console.log(`Source ID: ${record.get('S.name')} ----> Target ID: ${record.get('T.name')}`)

                let sourceID = record.get('S.name');    // ID of source user
                let targetID = record.get('T.name');    // ID of target user

                if (index === readResult.records.length - 1) {
                    // Do not include a comma if the transaction is the last in the list

                    getUserIds(sourceID, targetID)
                    // Appends source and target ids to the transaction json file
                    appendToTransactionJson("{\"source\":" + sourceID + ",\"target\":" + targetID + "}")

                } else {
                    getUserIds(sourceID, targetID)
                    // Appends source and target ids to the transaction json file
                    appendToTransactionJson("{\"source\":" + sourceID + ",\"target\":" + targetID + "},")
                }
            }

            // Timeout so closing bracket is written to end of json and not the middle
            appendToTransactionJson("]");
            // setTimeout(() => {  appendToTransactionJson("]"); }, 0);
        } catch (error) {
            console.error(`receiveDatabaseData ERROR: ${error}`);
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
        appendToUserJson("[")

        for await (const [index, id] of filteredUserIds.entries()) {

            if (index === filteredUserIds.length - 1) {
                // Do not include a comma if the id is that last id in the list
                appendToUserJson("{\"name\":" + id + "}");
            } else {
                appendToUserJson("{\"name\":" + id + "},");
            }
        }

        // Timeout so closing bracket is written to end of json and not the middle
        appendToUserJson("]");
        // setTimeout(() => {  appendToUserJson("]"); }, 0);
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
     * @param message String to overwrite file with
     */
    function appendToUserJson(message) {
        userJson += message.toString();
    }


    /**
     * Appends a given file with the given message
     * @param message String to append to a file
     */
    function appendToTransactionJson(message) {
        transactionJson += message.toString();
    }


    // export default DetailsPanel;