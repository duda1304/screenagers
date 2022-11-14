const mysql = require("mysql2");

var pool = mysql.createPool({
  user : "root",
  // password : "bubamara",
  host : "localhost",
  port : 3306,
  database : "screenagers",
  multipleStatements: true
});

// const mysqlConnection = mysql.createConnection({
//   user : process.env.DB_USER,
//   password : process.env.DB_PASSWORD,
//   host : process.env.DB_HOST,
//   port : process.env.DB_PORT,
//   database : process.env.DB_DATABASE,
//   multipleStatements: true
//   }); 

// mysqlConnection.connect((err) => {
//   if (!err) {
//     console.log("Connected");
//   } else {
//     console.log(err);
//     console.log("Connection Failed");
//   }
// });
 
module.exports = pool;
