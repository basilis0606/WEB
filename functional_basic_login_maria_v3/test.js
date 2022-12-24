const db = require('mariadb');
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

require('dotenv').config();

const server_port = 3000;

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'static')));


let cur_id = -1;

//try {
    const conn = db.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DBNM,
        pipelining: true
   });
/*}catch (error) {
    console.log("Database creation Failed.");
    throw error;
    process.exit();
}*/


//show login page once localhost:3000 is called
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname, 'login.html'));
});

//redirect to authorization page once login fields have been filled
app.post("/auth", async function(request, response) {
    let username = request.body.username_login;
    let password = request.body.password_login;

    cur_id=-1;
    
    if (username && password) {
        //load hashed password from db using username only
        let hashedpass = await (await conn).query("SELECT passwd FROM users WHERE username=\""+username+"\";");
        //console.log("password given: "+password);
        //console.log("Taking hashed password form user "+username);
        //console.log("Hashed password is: "+ hashedpass[0].passwd);
        
        //compare hased password with the password the user gave
        if (hashedpass.length > 0) {
            //compare hased password with the password the user gave
            bcrypt.compare(password, hashedpass[0].passwd, async function(error, isMatch) {
                if (error) {
                    console.log("Error while comparing passwords. Check detailes below:");
                    throw error;
                }
                if (isMatch) {
                    let idquery = "SELECT id FROM users WHERE username=\""+username+"\";";
                    let idresult = await ((await conn).query(idquery));
                
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
        } else {
            response.send("It seems like you are a new user! Go back to register first.");
        }
    }
    else{
        response.send("Please give username and password");
    }  
});

//redirect to register page once the register fields have been filled
app.post("/register", function(request, response){
    let username = request.body.username_register;
    let password = request.body.password_register;
    let email = request.body.email_register;

    cur_id=-1;

    if (username && password && email) {
        bcrypt.genSalt(10, (error, salt) => {
            if (error) {
                console.log("Unable to generate Salt. Aborting... (cur_id set to "+cur_id+").");
                throw error;
                process.abort;
            }

            bcrypt.hash(password, salt, async function(err, hash) {
                if (err) {
                    console.log("Unable to hash password. Aborting... (cur_id set to "+cur_id+").");
                    throw error;
                    process.abort;
                }

                let regquery = "INSERT INTO users VALUES (51, \""+username+"\", \""+hash+"\", \""+email+"\", DEFAULT, DEFAULT, DEFAULT, DEFAULT);";
                try {
                    let registration = await ((await conn).query(regquery));
                    response.send("Registered successfully!");   
                    console.log("Registered as "+username+", "+ hash +", real password: "+ password);
                }catch (error) {
                    console.log("Error while registerquery (insert into users values...). Check detailes below.");
                    throw error;
                }
                             
    
            });
        });
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

