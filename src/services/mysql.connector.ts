import { createPool, Pool } from 'mysql';
import logger from './logger.service';

let pool: Pool | null = null;

/**
 * Initializes the MySQL connection pool using environment variables.
 * Verifies connectivity by attempting to get and release a connection.
 * 
 * @throws {Error} If pool creation or connection verification fails
 */
const initializeMysqlConnector = () => {
    try {
        const connectionLimit = parseInt(process.env.MY_SQL_DB_CONNECTION_LIMIT || "10") || 10;
        const port = parseInt(process.env.MY_SQL_DB_PORT || "3306") || 3306;

        pool = createPool({
            connectionLimit: connectionLimit,
            port: port,
            host: process.env.MY_SQL_DB_HOST || '127.0.0.1',
            user: process.env.MY_SQL_DB_USER,
            password: process.env.MY_SQL_DB_PASSWORD,
            database: process.env.MY_SQL_DB_DATABASE,
            acquireTimeout: 60000, // 60 seconds to acquire connection
            timeout: 60000, // 60 seconds query timeout
            queueLimit: 0, // Unlimited queue (0 = no limit)
        });

        // Handle pool errors
        pool.on('error', (err: any) => {
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                logger.warn('MySQL connection lost. Pool will attempt to reconnect.', {
                    code: err.code,
                    errno: err.errno,
                    sqlState: err.sqlState
                });
            } else {
                logger.error('MySQL Pool Error', {
                    code: err.code,
                    errno: err.errno,
                    sqlState: err.sqlState,
                    message: err.message,
                    stack: err.stack
                });
            }
        });

        // Handle connection errors
        pool.on('connection', (connection: any) => {
            connection.on('error', (err: any) => {
                logger.error('MySQL Connection Error', {
                    code: err.code,
                    errno: err.errno,
                    sqlState: err.sqlState,
                    message: err.message
                });
            });
        });

        logger.info('MySQL Adapter Pool initialized', {
            database: process.env.MY_SQL_DB_DATABASE,
            host: process.env.MY_SQL_DB_HOST || '127.0.0.1',
            port: port,
            connectionLimit: connectionLimit
        });

        pool.getConnection((err, connection) => {
            if (err) {
                logger.error('MySQL connection failed', {
                    code: err.code,
                    errno: err.errno,
                    sqlState: err.sqlState,
                    message: err.message
                });
                throw new Error('not able to connect to database');
            }
            else {
                logger.info('MySQL connection verified successfully');
                connection.release();
            }
        });
    } catch (error) {
        logger.error('Failed to initialize MySQL pool', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
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
            if (!pool) {
                reject(new Error('Database pool not initialized'));
                return;
            }

            const startTime = Date.now();

            pool.query(query, params, (error, results) => {
                const duration = Date.now() - startTime;

                if (error) {
                    logger.error('MySQL Query Error', {
                        code: error.code,
                        errno: error.errno,
                        sqlState: error.sqlState,
                        message: error.message,
                        query: query.substring(0, 200),
                        duration: `${duration}ms`,
                        params: params
                    });
                    reject(error);
                } else {
                    // Log slow queries (> 1 second)
                    if (duration > 1000) {
                        logger.warn('MySQL Slow Query', {
                            duration: `${duration}ms`,
                            query: query.substring(0, 200)
                        });
                    }
                    resolve(results);
                }
            });
        });
    } catch (error) {
        logger.error('MySQL execute function error', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        throw new Error('failed to execute MySQL query');
    }
};

export { initializeMysqlConnector, pool };
