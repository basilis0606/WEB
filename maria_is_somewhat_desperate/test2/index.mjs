"use strict"
import mariadb from 'mariadb'
import express from 'express'
import * as url from 'url'
import { dbExecuteQuery } from './dbconnection.mjs';
import bodyParser from 'body-parser';

//__dirname is no longer built-in so we need access to it.
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//start expressJS app
const server = express();
//set up the port on which the app runs
const port = process.env.PORT || 3000;

//make it possible to access files from this folder via HTTP
server.use(express.static(__dirname));
//https://heynode.com/tutorial/process-user-login-form-expressjs/
/*.URLENCODED indicates that we are parsing URL encoded data from the body.
 When working with forms, we use the urlencoded parser because by default, 
 forms send data in URL encoded format.
 EXTENDED is an option allowing you to choose which library you want to use 
 to parse the URL encoded data. By default, this option is set to true and 
 will use the qs library. When set to false, like the example above, it uses 
 the QueryString library. */
server.use(bodyParser.urlencoded({ extended: false }));

//route for homepage = login page
server.get("/", (req, res) => {
    res.sendFile(__dirname+'/login.html');
});

server.post("/", (req, res) => {
    let username = req.body.username_login;
    let password = req.body.password_login;
    login(username, password);

});


//what happens if the user is redirected to a page that does not exist
server.use( ( req, res ) => {
    res.type( 'text/plain' )
    res.status( 404 )
    res.send('404 Not found')
    })

    //listen on the selected port 
server.listen(port, () => {
    console.log('Server listening on port:'+ port)

});

async function login(usnm, pswd)
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
  let query = "SELECT id FROM users WHERE username=\'"+usnm+"\' AND passwd= \'"+pswd+"\';";
  let rows = -1;
  rows = await conn.query(query);
  
  console.log(rows);
  
}catch (err) {
	throw err;
  }  finally {
	if (conn) console.log("Connection Terminated."); return conn.end();
  }

}

