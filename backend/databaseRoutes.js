const express = require("express");
const mysqlConnection = require("./database");

// const multer  = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// const AWS = require('aws-sdk');

const Router = express.Router();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// const fetch = require('node-fetch');

// Router.post("/getflightdata", async (req, res) => { 
//   const parameter = Object.keys(req.body)[0];
//   const value = req.body[parameter];
//   const response = await fetch(`https://app.goflightlabs.com/flights?access_key=${process.env.FLIGHTLABS_API_KEY}&${parameter}=${value}`);
//   const data = await response.json();
//   res.send(data);
//   // try {
//   //   const response = await fetch(`https://app.goflightlabs.com/flights?access_key=${process.env.FLIGHTLABS_API_KEY}&${parameter}=${value}`)
//   //   const data = await response.json()
//   //   .then(res.send(data))
// 	// } catch (error) {
// 	// 	res.send(error);
// 	// }
// });

// Router.post("/getairportdata", async (req, res) => { 
//   const response = await fetch(`https://app.goflightlabs.com/get-airport-data?access_key=${process.env.FLIGHTLABS_API_KEY}&query=${req.body.iata}`); 
//   const data = await response.json();
//   res.send(data);
//   // try {
//   //   const response = await fetch(`https://app.goflightlabs.com/flights?access_key=${process.env.FLIGHTLABS_API_KEY}&${parameter}=${value}`)
//   //   const data = await response.json()
//   //   .then(res.send(data))
// 	// } catch (error) {
// 	// 	res.send(error);
// 	// }
// });

// Router.post("/getairportdata", async (req, res) => { 
//   const departureCoordinates = await fetch(`https://app.goflightlabs.com/cities?access_key=${process.env.FLIGHTLABS_API_KEY}&query=${req.body.s_town}`);
//   const departureCoordinatesData = await departureCoordinates.json();
//   const arrivalCoordinates = await fetch(`https://app.goflightlabs.com/cities?access_key=${process.env.FLIGHTLABS_API_KEY}&query=${req.body.e_town}`);
//   const arrivalCoordinatesData = await arrivalCoordinates.json();  
//   // try {
//   //   const response = await fetch(`https://app.goflightlabs.com/flights?access_key=${process.env.FLIGHTLABS_API_KEY}&${parameter}=${value}`)
//   //   const data = await response.json()
//   //   .then(res.send(data))
// 	// } catch (error) {
// 	// 	res.send(error);
// 	// }
// });


// Router.post("/login", (req, res) => {  
//   const sql = "SELECT * FROM users WHERE email  = ? && password = ?; UPDATE users SET active = '1' WHERE email  = ? && password = ? && verified = '1';" 

//   mysqlConnection.query(
//     sql, 
//     [req.body.email,
//     md5(req.body.password),
//     req.body.email,
//     md5(req.body.password)],
//     (err, results, fields) => { 
//       if (!err) {
//         if (results[0].length === 0) {
//           res.send({"message" : "not found"});
//         } else if (results[1].affectedRows === 0) {
//           res.send({"message" : "not verified"});
//         }
//         else {
//           const jwttoken = jwt.sign(results[0][0].id, process.env.TOKEN_SECRET);  
//           res.send({'user' : results[0], 'token' : jwttoken});
//         }
      
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });

// Router.post("/checktoken", auth, (req, res) => {
//   const id = jwt_decode(req.body.token);
  
//   const sql = "SELECT ?? FROM users WHERE id  = ?";
 
//   mysqlConnection.query(
//     sql,
//     [ req.body.userData, 
//       id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// Router.post("/resendconfirmationemail", (req, res) => {

//   const sql = "SELECT id FROM users WHERE email  = ?";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.email],
//     async (err, results, fields) => {
//       if (!err) {
//         if (results.length > 0) {
//           res.send(results);
//           const jwttoken = jwt.sign(results[0].id, process.env.TOKEN_SECRET); 
//           sendEmail(req.body.email, jwttoken);
//         } else {
//           return res.status(404).json(results);
//         }
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// Router.post("/checkemailtoken", auth, (req, res) => {
//   const email = jwt_decode(req.body.token);

//   const sql = "UPDATE users SET verified = '1' WHERE id = ?";
 
//   mysqlConnection.query(
//     sql,
//     [email],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else { 
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });


// Router.post("/register", (req, res) => {
//   const sql = "INSERT INTO users (email, password) VALUES (?)";
//   mysqlConnection.query(
//     sql,
//     [[
//       req.body.email,
//       md5(req.body.password)]],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//         const jwttoken = jwt.sign(results.insertId, process.env.TOKEN_SECRET);  
//         sendEmail(req.body.email, jwttoken);
//       } else {
//         if (err.errno !== 1062) {
//           return res.status(500).json(err);
//         } else {
//           return res.status(409).json(err);
//         }
//       }
//     }
//   );
// });


// let space = new AWS.S3({
//   //Get the endpoint from the DO website for your space
//   endpoint: "sfo3.digitaloceanspaces.com", 
//   useAccelerateEndpoint: false,
//   //Create a credential using DO Spaces API key (https://cloud.digitalocean.com/account/api/tokens)
//   credentials: new AWS.Credentials(process.env.SPACES_ACCESS_KEY, process.env.SPACES_SECRET_KEY, null)
// });

// //Name of your bucket here
// const BucketNameProfiles = "userimages/profiles";
// const BucketNameProducts = "userimages/products";
// /* Upload file */
// Router.post('/uploadprofileimage', upload.single('image'), function(req, res, next) {
//   let uploadParameters = {
//     Bucket: BucketNameProfiles,
//     ContentType: req.file.mimetype,
//     Body: req.file.buffer,
//     ACL: 'public-read',
//     Key: req.file.originalname
//   };
 
//   space.upload(uploadParameters, function (error, data) {
//     if (error){
//       console.error(error);
//       res.sendStatus(500);
//       return;
//     }
//     res.sendStatus(200);
//   });
// });

// Router.post('/uploadproductimage', upload.single('image'), function(req, res, next) {
//   let uploadParameters = {
//     Bucket: BucketNameProducts,
//     ContentType: req.file.mimetype,
//     Body: req.file.buffer,
//     ACL: 'public-read',
//     Key: req.file.originalname
//   };
 
//   space.upload(uploadParameters, function (error, data) {
//     if (error){
//       console.error(error);
//       res.sendStatus(500);
//       return;
//     }
//     res.sendStatus(200);
//   });
// });

// Router.post("/saveuserdata",  auth, (req, res) => {
//   const sql = "UPDATE users SET image = ?, name = ?, username = ?, surname = ?, address_line1 = ?, address_line2 = ?, city = ?, country = ?, phone = ?, phoneCode = ?, bio = ? WHERE id = ?; SELECT ?? FROM users WHERE id = ?";
//   const id = jwt_decode(req.body.token);

//   mysqlConnection.query(
//     sql,
//     [
//       req.body.image,
//       req.body.name,
//       req.body.username,
//       req.body.surname,
//       req.body.address_line1,
//       req.body.address_line2,
//       req.body.city,
//       req.body.country,
//       req.body.phone, 
//       req.body.phoneCode,
//       req.body.bio,
//       id,
//       req.body.userData,
//       id
//       ],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results[1]);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });

// function roundNumber(number, decimalPlaces) {
//   return Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces)
// }

// Router.post("/savetripdata", (req, res) => {
//   const id = jwt_decode(req.body.token);

//   const sql = "INSERT INTO travel (flight_number, s_country, s_state, s_town, userID, role, e_country, e_state, e_town, `key`, departure_lat, departure_lng, arrival_lat, arrival_lng, departure_datetime, arrival_datetime) VALUES (?)";
  
//   mysqlConnection.query(
//     sql,
//     [
//       [req.body.flight_number,
//       req.body.s_country,
//       req.body.s_state,
//       req.body.s_town,
//       id,
//       req.body.role,
//       req.body.e_country,
//       req.body.e_state,
//       req.body.e_town, 
//       req.body.key, 
//       req.body.departure_lat,
//       req.body.departure_lng,
//       req.body.arrival_lat,
//       req.body.arrival_lng,
//       req.body.departure_datetime,
//       req.body.arrival_datetime]
//       ],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });

// Router.post("/saveproductdata",  (req, res) => {
  
//   const id = jwt_decode(req.body.token);

//   const sql = "INSERT INTO products (name, price, size, categoryID, userID, role, `key`, image, age_confirmed, store_type, store) VALUES (?) ON DUPLICATE KEY UPDATE name = ?, price = ?, size = ?, categoryID = ?, userID = ?, role = ?, image = ?, age_confirmed = ?, store_type = ?, store = ?; SELECT ?? FROM products WHERE `key` = ?"

//   mysqlConnection.query(
//     sql,
//     [
//       [req.body.name,
//       req.body.price,
//       req.body.size,
//       req.body.categoryID,
//       id,
//       req.body.role,
//       req.body.key,
//       req.body.image,
//       req.body.age_confirmed,
//       req.body.store_type,
//       req.body.store],
//       req.body.name,
//       req.body.price,
//       req.body.size,
//       req.body.categoryID,
//       id,
//       req.body.role,
//       req.body.image,
//       req.body.age_confirmed,
//       req.body.store_type,
//       req.body.store,
//       req.body.productData,
//       req.body.key
//     ],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results[1]);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );

 
// });


// function sendEmail(reciever, token) {
//   const transporter = nodemailer.createTransport({
//     // host: 'smtp.gmail.com',
//     // port: 587,
//     service: 'gmail',
//     auth: {
//       user: process.env.GOOGLE_USER,
//       pass: process.env.GOOGLE_PASSWORD
//     }
//   }); 
  
//   const mailOptions = {
//     from: process.env.GOOGLE_USER,
//     to: reciever,
//     subject: 'Welcome to ShopTheMile',
//     html: ` <p>Please click on link below to activate your account</p><br>
//             <a href='${process.env.DOMAIN}/confirm?token=${token}' style="cursor: context-menu">${process.env.DOMAIN}/confirm?token=${token}</a>`
//   };

//   transporter.verify().then(console.log).catch(console.log());
   
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// }

// Router.post("/getsellerdestinations", (req, res) => {
//   let id;
//   if (req.body.token !== null) {
//     id = jwt_decode(req.body.token);
//   } else {id = 'null'}

//   const sql = "SELECT e_town, e_state, e_country FROM travel WHERE active = '1' && userID != ?";
 
//   mysqlConnection.query(
//     sql,
//     [id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// Router.post("/getcountries", (req, res) => {
//   const sql = "SELECT * FROM country ORDER BY nicename";
 
//   mysqlConnection.query(
//     sql,
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// Router.post("/getcategories", (req, res) => {
//   const sql = "SELECT * FROM categories ORDER BY name";
 
//   mysqlConnection.query(
//     sql,
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// Router.post("/getsellercategories", (req, res) => {
//   let id;
//   if (req.body.token !== null) {
//     id = jwt_decode(req.body.token);
//   } else {id = 'null'}

//   const sql = "SELECT * FROM categories ORDER BY name; SELECT * FROM products WHERE active = '1' && role = 'seller' && userID != ? ";
 
//   mysqlConnection.query(
//     sql,
//     [id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send({'category-names' : results[0], 'sellers-categories' : results[1]});
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// Router.post("/getsizes", (req, res) => {
//   const sql = "SELECT * FROM sizes ORDER BY id";
 
//   mysqlConnection.query(
//     sql,
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// Router.post("/getusers", (req, res) => {
//   let id;
//   if (req.body.token !== null) {
//     id = jwt_decode(req.body.token);
//   } else {id = 'null'}

//   const sql = "SELECT * FROM users WHERE active = '1' && id != ?";
 
//   mysqlConnection.query(
//     sql,
//     [id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// Router.post("/getuserdata", (req, res) => {
  
//   const sql = "SELECT ? FROM users WHERE id = ?";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.offerUserData,
//       req.body.id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// // unloged user can see these
// Router.post("/getallproducts", (req, res) => {
//   let id;
//   if (req.body.token !== null) {
//     id = jwt_decode(req.body.token);
//   } else {id = 'null'}

//   const sql = "SELECT * FROM products WHERE active = '1' && role = 'seller' && userID != ?";
 
//   mysqlConnection.query(
//     sql,
//     [id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     } 
//   );
// });

// Router.post("/getsellersbydestination", (req, res) => {
//   let id;
//   if (req.body.token !== null) {
//     id = jwt_decode(req.body.token);
//   } else {id = 'null'}
  
//   req.body.travelData.forEach((element, index) => req.body.travelData[index] = 'travel.' + element);
//   req.body.userData.forEach((element, index) => req.body.userData[index] = 'users.' + element);

//   let sql = "SELECT " +  req.body.travelData.join(',') + "," + req.body.userData.join(',') +  " FROM travel INNER JOIN users ON travel.userID = users.id WHERE travel.active = '1' && travel.role = 'seller' && travel.userID != ?";

//   if (req.body.destination !== '') {
//     sql  = sql + " && e_town = ?";
//   } else {
//     sql = sql + " LIMIT 50";
//   }

//   mysqlConnection.query(
//     sql,
//     [ id,
//       req.body.destination],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 
 
// Router.post("/getsellersbycategory", (req, res) => { 
//   let id; 
//   if (req.body.token !== null) {
//     id = jwt_decode(req.body.token);
//   } else {id = 'null'}
  
//   req.body.travelData.forEach((element, index) => req.body.travelData[index] = 'travel.' + element);
//   req.body.productData.forEach((element, index) => req.body.productData[index] = 'products.' + element);

//   // let sql = "SELECT * FROM products INNER JOIN travel USING (`key`) WHERE products.active = '1' && products.role ='seller' && products.userID != ?";
//   let sql = "SELECT " +  req.body.travelData.join(',') + "," + req.body.productData.join(',') + " FROM products INNER JOIN travel USING (`key`) WHERE products.active = '1' && products.role ='seller' && products.userID != ?";

//   if (req.body.categoryID !== '') {
//     sql  = sql + " && products.categoryID = ?";
//   } else {
//     sql = sql + " LIMIT 50";
//   }

//   mysqlConnection.query(
//     sql,
//     [id,
//       req.body.categoryID],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getsellersbyproductname", (req, res) => { 
//   let id; 
//   if (req.body.token !== null) {
//     id = jwt_decode(req.body.token);
//   } else {id = 'null'}
  
//   req.body.travelData.forEach((element, index) => req.body.travelData[index] = 'travel.' + element);
//   req.body.productData.forEach((element, index) => req.body.productData[index] = 'products.' + element);


//   const sql = "SELECT " +  req.body.travelData.join(',') + "," + req.body.productData.join(',') + " FROM products INNER JOIN travel USING (`key`) WHERE products.name = ? && products.active = '1' && products.role ='seller' && products.userID != ? ;";

//   mysqlConnection.query(
//     sql,
//     [req.body.name,
//     id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getselleroffers", (req, res) => {
//   // token checked before rendering this page
//   id = jwt_decode(req.body.token);

//   req.body.travelData.forEach((element, index) => req.body.travelData[index] = 'travel.' + element);
//   req.body.productData.forEach((element, index) => req.body.productData[index] = 'products.' + element);

//   for( var i = 0; i < req.body.productData.length; i++){ 
    
//     if ( req.body.productData[i] === 'products.key') { 

//       req.body.productData.splice(i, 1); 
//     }
// }

//   let sql = "SELECT " +  req.body.travelData.join(',') + "," + req.body.productData.join(',') +  " FROM travel LEFT JOIN products ON travel.key = products.key WHERE travel.active = '1' && travel.role = 'seller' && travel.userID = ?";
  
//   mysqlConnection.query(
//     sql,
//     [id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// // Router.post("/getbuyeroffers", (req, res) => {
// //   const sql = "SELECT * FROM rooms INNER JOIN travel USING (`key`) INNER JOIN products USING (`key`) WHERE rooms.buyer = ? && rooms.active = '1'";
// //   id = jwt_decode(req.body.token);
// //   // let id;
// //   // if (typeof(req.body.seller) !== 'number') {
    
// //   // } else {
// //   //   id = req.body.seller
// //   // }
  
// //   mysqlConnection.query(
// //     sql,
// //     [id],
// //     (err, results, fields) => {
// //       if (!err) {
// //         res.send(results);
// //       } else {
// //         return res.status(500).json(err);
// //       }
// //     }
// //   );
// // }); 

// Router.post("/getallsellersoffers", (req, res) => {
//   const sql = "SELECT * FROM travel WHERE active = '1' && role = 'seller'"; 
  
//   mysqlConnection.query(
//     sql,
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });

// Router.post("/gettripdata", (req, res) => {
//   const sql = "SELECT ? FROM travel WHERE `key` = ?";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.travelData,
//       req.body.key],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getsellerdata", (req, res) => {
//   const sql = "SELECT * FROM users WHERE id = ? && active = 1";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getprofileimage", (req, res) => {
//   const sql = "SELECT * FROM users WHERE id = ?";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.userID],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getusername", (req, res) => {
//   const sql = "SELECT username FROM users WHERE id = ?";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.userID],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getproductdata", (req, res) => {
//   const sql = "SELECT ?? FROM products WHERE active = '1' && `key` = ?";
 
//   mysqlConnection.query(
//     sql,
//     [ req.body.productData,
//       req.body.key],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getproductlocation", (req, res) => {
//   const sql = "SELECT s_town, s_country FROM travel WHERE `key` = ?";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.key],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getcategoryname", (req, res) => {
//   const sql = "SELECT * FROM categories WHERE id = ?";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.categoryID],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getproductsize", (req, res) => {
//   const sql = "SELECT * FROM sizes WHERE id = ?";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.sizeID],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getallowanceinfo", (req, res) => {
//   const sql = "SELECT * FROM allowance WHERE country = ?";
 
//   mysqlConnection.query(
//     sql,
//     [req.body.country],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 



// // MESSAGES
// Router.post("/getallmessages", (req, res) => {
//   const id = jwt_decode(req.body.token);
//   let parameters = [];
 
//   const sql = "SELECT * FROM messages INNER JOIN travel USING (`key`) WHERE buyer = ? ORDER BY `key`, timestamp; SELECT * FROM messages INNER JOIN travel USING (`key`) WHERE seller = ? ORDER BY buyer, timestamp ";
  
//   mysqlConnection.query(
//     sql,
//     [id,
//     id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send({"as_buyer" : results[0], "as_seller" : results[1]});
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/getmessages", (req, res) => {
//   let id;
//   if (req.body.buyer.token) {
//     id = jwt_decode(req.body.buyer.token);
//   } else {
//     id = req.body.buyer
//   }
 
//   const sql = "SELECT * FROM messages WHERE `key` = ? && buyer = ? ORDER BY timestamp";
  
//   mysqlConnection.query(
//     sql,
//     [req.body.key,
//     id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/checkifchatexists", (req, res) => {
//   const id = jwt_decode(req.body.token);
 
//   const sql = "SELECT * FROM messages WHERE `key` = ? && ?? = ? ORDER BY timestamp";
  
//   mysqlConnection.query(
//     sql,
//     [req.body.key,
//     req.body.role,
//     id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// // check if anything unread
// Router.post("/checknewmessages", auth, (req, res) => {
//   const id = jwt_decode(req.body.token);

//   req.body.travelData.forEach((element, index) => req.body.travelData[index] = 'travel.' + element);

//   const sql = "SELECT messages.*," + req.body.travelData.join(',') + " FROM messages INNER JOIN travel ON messages.key = travel.key WHERE `read` = 0 && buyer = ? && sender != ?; SELECT messages.*," + req.body.travelData.join(',') + " FROM messages INNER JOIN travel ON messages.key = travel.key WHERE `read` = 0 && seller = ? && sender != ?";
 
//   mysqlConnection.query(
//     sql,
//     [id,
//     id,
//     id,
//     id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send({"as_buyer" : results[0], "as_seller" : results[1]});
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 


// Router.post("/savemessage", (req, res) => {
//   const sql = "INSERT INTO messages (`key`, buyer, seller, message, timestamp, sender) VALUES (?)";

//   let id;
//   if (req.body.buyer.token) {
//     id = jwt_decode(req.body.buyer.token);
//   } else {
//     id = req.body.buyer
//   }

//   mysqlConnection.query(
//     sql,
//     [[
//       req.body.key,
//       id,
//       req.body.seller,
//       req.body.message,
//       req.body.timestamp,
//       jwt_decode(req.body.sender)
//     ]],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });

// Router.post("/markmessagesread", (req, res) => {
//   const sql = "UPDATE messages SET `read` = 1 WHERE `key` = ? && seller = ? && buyer = ? && `read` = 0";

//   let buyer;
//   if (req.body.buyer.token) {
//     buyer = jwt_decode(req.body.buyer.token)
//   } else {
//     buyer = req.body.buyer
//   }

//   mysqlConnection.query(
//     sql,
//     [req.body.key,
//     req.body.seller,
//     buyer],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// // REQUESTS

// Router.post("/getrequests",(req, res) => {
//   const id = jwt_decode(req.body.token);

//   req.body.travelData.forEach((element, index) => req.body.travelData[index] = 'travel.' + element);
//   req.body.productData.forEach((element, index) => req.body.productData[index] = 'products.' + element);

//   let sql = "SELECT requests.*, " +  req.body.travelData.join(',') + "," + req.body.productData.join(',') + " FROM requests INNER JOIN travel ON requests.key = travel.key INNER JOIN products ON requests.key = products.key WHERE ?? = ?";
 
//   if (req.body.key) {
//     sql = sql + " && requests.key = ?";
//   }

//   if (req.body.buyer) {
//     sql = sql + " && requests.buyer = ?";
//   }
//   mysqlConnection.query(
//     sql,
//     [req.body.role,
//     id,
//     req.body.key,
//   req.body.buyer],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 

// Router.post("/saverequestdata",  (req, res) => {
//   const id = jwt_decode(req.body.buyer);

//   const sql = "INSERT INTO requests (`key`, order_number, seller, buyer, tip, delivery, additional_info, quantity) VALUES (?)";

//   mysqlConnection.query(
//     sql,
//     [
//       [req.body.key,
//       req.body.order_number,
//       req.body.seller,
//       id,
//       req.body.tip,
//       req.body.delivery,
//       req.body.additional,
//       req.body.quantity]
//     ],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });

// Router.post("/updaterequeststatus",(req, res) => {
//   const sql = "UPDATE requests SET status = ? WHERE `key` = ? && buyer = ?";

 
//   mysqlConnection.query(
//     sql,
//     [req.body.status,
//     req.body.key,
//     req.body.buyer],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// }); 




// // OLD APP

// function generateAccessToken(username) {
//   return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
// }

// Router.post("/checkifuserexists", (req, res) => {
//   const sql = "SELECT * FROM diaries WHERE diary = ?";

//   mysqlConnection.query(
//     sql,
//     [req.body.diary],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });


// Router.post("/changediarypassword", (req, res) => {
//   const sql = "UPDATE diaries SET password = ? WHERE diary = ? AND password = ?";

//   mysqlConnection.query(
//     sql,
//     [md5(req.body.newPassword),
//     req.body.diary,
//     md5(req.body.password)
//     ],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         console.log(err);
//         return res.status(500).json(err);
//       }
//     }
//   );
// });

// Router.post("/deletediary", (req, res) => {
//   const sql = "DELETE FROM diaries WHERE id = ?";

//   mysqlConnection.query(
//     sql,
//     [req.body.diaryID
//     ],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         console.log(err);
//         return res.status(500).json(err);
//       }
//     }
//   );
// });


// Router.post("/newentry", (req, res) => {  
//   getThumbnail(req.body.link)
//   .then((response) => {
//     const sql = "INSERT INTO entries (title, description, link, performers, rating, categories, diaryID, date, screenshot) VALUES (?)";
//     mysqlConnection.query(
//       sql,
//       [[req.body.title,
//       req.body.description,
//       req.body.link,
//       req.body.performers,
//       req.body.rating,
//       req.body.categories,
//       req.body.diaryID,
//       new Date(),
//       response.img
//       ]],
//       (err, results, fields) => {
//         if (!err) {
//           res.send(results);
//         } else {
//           return res.status(500).json(err);
//         }
//       }
//     );
//   })
//   .catch(err => {
//     return res.status(500).json(err);
//   });
// });

// Router.post("/getentries", (req, res) => {
//   let sql;
  
//   if (req.body.orderby === 'date DESC') {
//     sql = "SELECT * FROM entries WHERE diaryID = ? ORDER BY date DESC"
//   }
//   else if (req.body.orderby === 'date ASC') {
//     sql = "SELECT * FROM entries WHERE diaryID = ? ORDER BY date ASC"
//   }
//   else if (req.body.orderby === 'rating DESC') {
//     sql = "SELECT * FROM entries WHERE diaryID = ? ORDER BY rating DESC"
//   } else {
//       sql = "SELECT * FROM entries WHERE diaryID = ? ORDER BY rating ASC"
//     }
//   mysqlConnection.query(
//     sql,
//     [req.body.diaryID
//     ],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });


// Router.get("/gettrendingdiaries", (req, res) => {
//   const date = new Date();
//   const pastDate = date.getDate() - 7;
//   date.setDate(pastDate);

//   const sql = "SELECT followsDiaryID FROM follows WHERE date > ? ORDER BY followsDiaryID ASC"
//   mysqlConnection.query(
//     sql,
//     [date
//     ],
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });

// Router.post("/gettrendingdiariesdata", (req, res) => {

//   let search = ' id = ' + req.body.diaries[0];
//   let i;
//   for(i = 1; i < req.body.diaries.length; i++) {
//     search = search + ' OR id = ' + req.body.diaries[i];
//   }
 
//   const sql = "SELECT id, diary, mostwatchedcategory, privacy FROM diaries WHERE privacy = 1 AND (" + search + ")";

//   console.log(sql + search)
//   mysqlConnection.query(
//     sql,
//     (err, results, fields) => {
//       if (!err) {
//         res.send(results);
//       } else {
//         return res.status(500).json(err);
//       }
//     }
//   );
// });



module.exports = Router;