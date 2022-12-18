"use strict";

// Custom module for creating a mariadb connection
// And quering the database API.
import mariadb from 'mariadb';
import {} from 'dotenv/config';

// async functions return promises
export async function mariadbConnection() {
    let conn;
    try {
        // Establish a mariadb connection
        // await can be only used inside of async 
        // functions. Await expressions yield execution
        // to a promise based asynchronous operation and 
        // resume after the awaited operation is either
        // fullfileed or rejected.
        conn = await mariadb.createConnection({
            host : process.env.MDB_HOST,
            port: process.env.MDB_PORT,
            user: process.env.MDB_USER,
            password: process.env.MDB_PASS,
            database: process.env.MDB_DBNM,
            pipelining: true,
        });
        let res = await usersquery(conn);
        console.log('The user query returned with signal : ' + res);
    } catch (error) {
        console.log("SQL error in establishing a connection: ", error);
    } finally {
        if ( conn ) await conn.close();
    }
}

async function usersquery(conn) {
    try {
       await conn.beginTransaction();
       try {
           var rows = await conn.query("SELECT username, email FROM users");
           for (let i = 0, len = rows.length; i < len; i++) {
                console.log('Username = ' + rows[i].username + '   Email = ' + rows[i].email );
            }
        } catch (err) {
          console.error("Error querying users: ", err);
        }
    } catch (err) {
       console.error("Error starting a transaction: ", err);
       return Promise.reject(0);
    }
    return Promise.resolve(1);
}
