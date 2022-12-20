const mariadb = require("mariadb");


// Main function
async function main() {
   let conn;

   try {
      conn = await mariadb.createConnection({
         host: "localhost",
         port: 3306,
         user: "root",
         password: "maria",
         database: "web_2023",
      });

      // Use Connection to get contacts data
      var rows = await get_contacts(conn);

      //Print list of contacts
      for (i = 0, len = rows.length; i < len; i++) {
         console.log(rows[i].first_name +" "+ rows[i].last_name +" "+ rows[i].email);
      }
   } catch (err) {
      // Manage Errors
      console.log(err);
   } finally {
      // Close Connection
      if (conn) conn.close();
   }
}

//Get list of contacts
function get_contacts(conn) {
   return conn.query("SELECT id, username, passwd FROM users WHERE id=3");
}

main();