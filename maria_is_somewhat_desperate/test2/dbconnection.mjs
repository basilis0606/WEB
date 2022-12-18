"use strict"
import mariadb from 'mariadb';
import fs from 'fs'

export async function dbExecuteQuery(query)
{
  let conn;
  try {
	conn = await mariadb.createConnection({
        host: 'localhost', 
        port: 3306,
        user:'root', 
        password: 'maria',
        database: 'web_2023'
  });
  console.log("Connection Established.");
  rows = await conn.query(query);
  return rows;
  
}catch (err) {
	throw err;
  } finally {
	if (conn) console.log("Connection Terminated."); return conn.end();
  }

}
