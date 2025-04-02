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
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
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

// insert on PlayerHas
async function insertPlayer(username, user_credentials, xp, email, skin, iid) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO PlayerHas (username, user_credentials, xp, email, skin, iid) VALUES (:username, :user_credentials, :xp, :email, :skin, :iid)`,
            [username, user_credentials, xp, email, skin, iid],
            { autocommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    })
}

// update non primary key on PlayerHas
async function updatePlayerTable(username, email) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE PlayerHas SET email=:email where username=:username`,
            [email, username],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// division on Achievement (achievements everyone has)
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

// projection on Mob
async function projMob(params) {
  const sql = "SELECT " + params + " from Mob1";

  return await withOracleDB(async (connection) => {
    const result = await connection.execute(sql);
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
    divAchievement,
    projMob,
};
