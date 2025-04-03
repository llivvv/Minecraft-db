const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

// ----------------------------------------------------------
// Core functions for database operations
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

// fetch Players from database
async function fetchPlayersFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM PlayerHas');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// INSERT on PlayerHas
async function insertPlayer(username, user_credentials, xp, email, skin, iid) {
	const xpInt = parseInt(xp, 10);
    const skinInt = parseInt(skin, 10);
    const iidInt = parseInt(iid, 10);
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT
             INTO PLAYERHAS (username, user_credentials, xp, email, skin, iid)
             VALUES (:username, :user_credentials, :xp, :email, :skin, :iid)`,
            [username, user_credentials, xpInt, email, skinInt, iidInt],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// UPDATE on PlayerHas
async function updatePlayerTable(username, email, xp) {
	const xpInt = parseInt(xp, 10);
	console.log(xpInt);

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE PlayerHas SET email=:email, xp=:xp where username=:username`,
            [email, xpInt, username],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// DELETE on PlayerHas
async function deletePlayer(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM PlayerHas where username=:username`,
            [username],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// DIVISION on Achievement (achievements everyone has)
async function divAchievement() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
        SELECT a.aname
        FROM Achievement a
        WHERE NOT EXISTS
        ((SELECT p.username FROM PlayerHas p)
         MINUS
         (SELECT ac.username
          FROM Achieve ac
          WHERE ac.aname = a.aname)
         )
        `);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// PROJECTION on Mob
async function projMob(params) {
  const sql = "SELECT " + params + " from Mob1";

  return await withOracleDB(async (connection) => {
    const result = await connection.execute(sql);
    return result.rows;
  }).catch(() => {
    return [];
  });
}

// SELECTION on Server
async function selectServer(clauses) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
        SELECT *
        FROM Servers
        WHERE 
        ` + clauses);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// AGGREGATION with HAVING on Saved (worlds saved by more than 2 players)
async function havingSaved() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
        SELECT join_code, COUNT(*)
        FROM Saved
        GROUP BY join_code
        HAVING COUNT(*) > 2
        `);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// AGGREGATION with BY GROUP BY on Achieve
async function groupByAchieve() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
        SELECT aname, COUNT(*)
        FROM Achieve
        GROUP BY aname
        `);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// NESTED AGGREGATION with GROUP BY on Achieve
async function nestedAggAvgProgress() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT a.aname, AVG(a.progress) AS avg_progress
            FROM Achieve a
            GROUP BY a.aname
            HAVING AVG(a.progress) > (
                SELECT AVG(a2.progress)
                FROM Achieve a2
            )
        `,);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// JOIN on Player and Achieve
async function joinPlayerAchieve(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT p.username, p.xp, p.email, a.aname, a.date_received, a.progress
            FROM PlayerHas p
            JOIN Achieve a ON p.username = a.username
            WHERE p.username = :username`,
            [username]
        );

        return result.rows;
    }).catch(() => {
        return [];
    });
}

module.exports = {
    testOracleConnection,
    fetchPlayersFromDb,
    insertPlayer,
    updatePlayerTable,
    deletePlayer,
    divAchievement,
    projMob,
    selectServer,
    havingSaved,
    groupByAchieve,
    nestedAggAvgProgress,
    joinPlayerAchieve,
};
