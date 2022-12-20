const db = require('mariadb');
const express = require('express');
const path = require('path');


const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'static')));


let cur_id = -1;

const conn = db.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "maria",
    database: "web_2023",
    pipelining: true
});

//show login page once localhost:3000 is called
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname, 'login.html'));
});

app.post("/auth", async function(request, response) {
    let username = request.body.username_login;
    let password = request.body.password_login;
    
    if (username && password) {    
        let idquery = "SELECT id FROM users WHERE username=\""+username+"\" AND passwd=\""+password+"\";";
        let idresult = await ((await conn).query(idquery));
        if (idresult.length > 0) {
            cur_id = idresult[0].id;
            console.log("login will return a promise containig id-value= "+cur_id);
            response.send("Your id is: "+cur_id);
        }
        else {
            response.send("Incorrect username or password.")
        }
    }
    else{
        response.send("Please give username and password");
    }
   
});


app.listen(3000);

