"use strict"

import mariadb from 'mariadb';
import express from 'express';
import * as url from 'url';
import bcrypt from 'bcrypt';
import {} from 'dotenv/config';
import sessions  from 'express-session';
import cookieParser from 'cookie-parser';

const server_port = 3000;
const oneDay = 1000 * 60 * 60 * 24; //cookie life
const email_regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const password_regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[#$*&@])[A-Za-z\d#$*&@]{8,}$/;

var session;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


const app = express();
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

//app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname+ '/static'));

app.use(cookieParser());

let cur_id = -1;

//try-catch block for every db interaction
const conn = mariadb.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DBNM,
    pipelining: true
});

//show login page once localhost:3000 is called
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(__dirname + 'login.html');
});

//redirect to authorization page once login fields have been filled
app.post("/auth", async function(request, response) {
    let username = request.body.username_login;
    let password = request.body.password_login;

    cur_id=-1;
    
    if (username && password) { //remains only if front-end doesn't prevent empty fields
        //load hashed password from db using username only
        let hashedpass;
        let email = String(username).toLowerCase().match(email_regex);
        //check if username is email and perform the right query
        if (email) 
            hashedpass = await (await conn).query("SELECT passwd FROM users WHERE email=\""+username+"\";");
        else 
            hashedpass = await (await conn).query("SELECT passwd FROM users WHERE username=\""+username+"\";");

        //query returned something: the user exists
        if (hashedpass.length > 0) {
            //compare hased password with the password the user gave
            bcrypt.compare(password, hashedpass[0].passwd, async function(error, isMatch) {
                if (error) {
                    console.log("Error while comparing passwords. Check detailes below:");
                    throw error;
                }
                if (isMatch) {
                    session=request.session;
                    session.userid=request.body.username_login;
                    console.log(request.session);
                    
                    let idquery;
                    let idresult;
                    if (email)
                         idquery = "SELECT id FROM users WHERE email=\""+username+"\";";
                    else
                        idquery = "SELECT id FROM users WHERE username=\""+username+"\";";
                    
                    idresult = await ((await conn).query(idquery));
                
                    if (idresult.length > 0) {
                        cur_id = idresult[0].id;
                        console.log("login will return a promise containig id-value= "+cur_id);
                        response.send("Your id is: "+cur_id);
                    } else { //we should never reach this code section
                        console.log("login will return a promise containig id-value= "+cur_id);
                        response.send("isMatch but id query returned nothing (no sense)")
                    }

                } else {
                    response.send("Incorrect username or password");
                }
            })  
        } else { //query returned nothing: the user is not in the database
            response.send("It seems like you are a new user! Go back to register first.");
        }
    }
    else{ //empty fields
        response.send("Please give username and password");
    }  
});

//redirect to register page once the register fields have been filled
app.post("/register", function(request, response){
    let username = request.body.username_register;
    let password = request.body.password_register;
    let email = request.body.email_register;

    cur_id=-1;

    if (username && password && email) {   //remains only if front end doesn't prevent empty fields
        if (!String(email).toLowerCase().match(email_regex)) {
            //invalid email during registration
            response.send("Invalid email. Please go back and register aggain with a valid email.");
        }
        else if (!String(password).match(password_regex)){
            //invalid password during registration
            response.send("Invalid password. Please go back and register aggain with a valid password.");    
        }
        else {
            bcrypt.genSalt(10, (error, salt) => {
                if (error) {
                    console.log("Unable to generate Salt (cur_id set to "+cur_id+").");
                    throw error;
                }
    
                bcrypt.hash(password, salt, async function(err, hash) {
                    if (err) {
                        console.log("Unable to hash password (cur_id set to "+cur_id+").");
                        throw error;
                    }
    
                    let regquery = "INSERT INTO users VALUES (51, \""+username+"\", \""+hash+"\", \""+email+"\", DEFAULT, DEFAULT, DEFAULT, DEFAULT);";
                    try {
                        let registration = await ((await conn).query(regquery));
                        //response.send("Registered successfully!");
                        response.redirect('/');
                        console.log("Registered as "+username+", "+ hash +", real password: "+ password);
                    }catch (error) {
                        console.log("Error while registerquery (insert into users values...). Check details below.");
                        throw error;
                    }
                                 
        
                });
            });

        }     
    } else {
        response.send("Please give username and password");
    }
});

app.use( ( req, res ) => {
    res.type( 'text/plain' )
    res.status( 404 )
    res.send('404 Not found')
    })

app.listen(server_port);

