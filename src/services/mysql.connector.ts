import { createPool, Pool } from 'mysql';

let pool: Pool | null = null;

/**
 * Initializes the MySQL connection pool using environment variables.
 * Verifies connectivity by attempting to get and release a connection.
 * 
 * @throws {Error} If pool creation or connection verification fails
 */
const initializeMysqlConnector = () => {
    try {
        pool = createPool({
            connectionLimit:
                parseInt(process.env.MY_SQL_DB_CONNECTION_LIMIT != undefined ? process.env.MY_SQL_DB_CONNECTION_LIMIT : ""),
            port:
                parseInt(process.env.MY_SQL_DB_PORT != undefined ? process.env.MY_SQL_DB_PORT : ""),
            host: process.env.MY_SQL_DB_HOST,
            user: process.env.MY_SQL_DB_USER,
            password: process.env.MY_SQL_DB_PASSWORD,
            database: process.env.MY_SQL_DB_DATABASE,
        });

        console.debug('MySql Adapter Pool generated successfully');
        console.log('process.env.DB_DATABASE', process.env.MY_SQL_DB_DATABASE);

        pool.getConnection((err, connection) => {
            if (err) {
                console.log('error mysql failed to connect');
                throw new Error('not able to connect to database');
            }
            else {
                console.log('connection made');
                connection.release();
            }
        });
    } catch (error) {
        console.error('[mysql.connector][InitializeMysqlConnector][Error]: ', error);
        throw new Error('failed to initialized pool');
    }
};

/**
 * Executes a parameterized MySQL query using the connection pool.
 * Automatically initializes the pool if it hasn't been created yet.
 * 
 * @template T - The expected return type of the query results
 * @param {string} query - SQL query string with parameter placeholders (?)
 * @param {string[] | Object} params - Parameters to bind to the query
 * @returns {Promise<T>} Promise that resolves with query results
 * @throws {Error} If query execution fails
 */
export const execute = <T>(query: string, params: string[] | Object): Promise<T> => {
    try {
        if (!pool) {
            initializeMysqlConnector();
        }

        return new Promise<T>((resolve, reject) => {
            pool!.query(query, params, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
    } catch (error) {
        console.error('[mysql.connector][execute][Error]: ', error);
        throw new Error('failed to execute MySQL query');
    }
};

export { initializeMysqlConnector, pool };
