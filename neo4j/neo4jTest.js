(async() => {
    const neo4j = require('neo4j-driver');

    const uri = 'neo4j+s://d0a1241d.databases.neo4j.io';
    const user = 'neo4j';
    const password = 'WCUCapstone2022';

    // To learn more about the driver: https://neo4j.com/docs/javascript-manual/current/client-applications/#js-driver-driver-object
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

    try {
        await getUserIds(driver);
        await getSourceIds(driver);
        await getTargetIds(driver);

        // await findPerson(driver, person2Name);
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        // Don't forget to close the driver connection when you're finished with it.
        await driver.close();
    }

    /**
     * Gets ids of the users in the database
     * @param driver neo4j driver for running a query
     * @returns {Promise<void>}
     */
    async function getUserIds(driver) {

        const session = driver.session({ database: 'neo4j' });

        try {
            const readQuery = `MATCH (n) WHERE (n.name) IS NOT NULL 
                                RETURN DISTINCT "node" as entity, n.name AS name 
                                UNION ALL 
                                MATCH ()-[r]-() WHERE (r.name) IS NOT NULL 
                                RETURN DISTINCT "relationship" AS entity, r.name AS name`;

            const readResult = await session.readTransaction(tx =>
                tx.run(readQuery)
            );

            // console.log(readResult.records.toLocaleString())

            readResult.records.forEach(record => {
                // const test = record.get('n')
                console.log(`Found person id: ${record.get('name')}`)
            });
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }

    /**
     * Gets ids of the source of a transaction from the database
     * @param driver neo4j driver for running a query
     * @returns {Promise<void>}
     */
    async function getSourceIds(driver) {

        const session = driver.session({ database: 'neo4j' });

        try {
            const readQuery = `MATCH (n) WHERE (n.source) IS NOT NULL 
                                RETURN DISTINCT "node" as entity, n.source AS source 
                                UNION ALL 
                                MATCH ()-[r]-() WHERE (r.source) IS NOT NULL 
                                RETURN DISTINCT "relationship" AS entity, r.source AS source`;

            const readResult = await session.readTransaction(tx =>
                tx.run(readQuery)
            );

            // console.log(readResult.records.toLocaleString())

            readResult.records.forEach(record => {
                // const test = record.get('n')
                console.log(`Found source id: ${record.get('source')}`)
            });
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }

    /**
     * Gets ids of the target of a transaction from the database
     * @param driver neo4j driver for running a query
     * @returns {Promise<void>}
     */
    async function getTargetIds(driver) {

        const session = driver.session({ database: 'neo4j' });

        try {
            const readQuery = `MATCH (n) WHERE (n.target) IS NOT NULL 
                                RETURN DISTINCT "node" as entity, n.target AS target
                                UNION ALL 
                                MATCH ()-[r]-() WHERE (r.target) IS NOT NULL 
                                RETURN DISTINCT "relationship" AS entity, r.target AS target`;

            const readResult = await session.readTransaction(tx =>
                tx.run(readQuery)
            );

            // console.log(readResult.records.toLocaleString())

            readResult.records.forEach(record => {
                // const test = record.get('n')
                console.log(`Found target id: ${record.get('target')}`)
            });
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }

})();
