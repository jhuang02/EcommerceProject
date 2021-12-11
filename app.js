/*
 * Names: Justin Yang, Jerry Huang
 * Date: 12/1/2021
 * Section: CSE 154 AD
 *
 * Description:
 */

'use strict';

const express = require('express');
const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const multer = require('multer');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const CLIENT_ERROR = 400;
const SERVER_ERROR = 500;
const INVALID_PARAMETERS = 'Missing one or more of the required params.';
const SERVER_ERROR_MSG = 'An error occurred on the server. Try again later.';
const NODE_PORT = 8000;

app.get('/ecommerce/products', async (req, res) => {
  let searchId = req.query.search;
  try {
    let db = await getDBConnection();
    let qry;
    let retrievedData;
    if (searchId === undefined) {
      console.log("success");
      qry = 'SELECT * FROM product;';
      retrievedData = await db.all(qry);

    } else {
      qry = 'SELECT * FROM product WHERE name = ?;';
      retrievedData = await db.all(qry, searchId);
    }
    res.type('json').send({'products': retrievedData});
    await db.close();
  } catch (error) {
    res.type('text').status(SERVER_ERROR)
      .send(SERVER_ERROR_MSG);
  }
});

app.post('/ecommerce/authentication', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  res.type('text');
  if (username === undefined || password === undefined) {
    res.status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let qry = 'SELECT COUNT(*) FROM user WHERE username = ? and password = ?';
      let retrievedData = await db.all(qry, [username, password]);
      if (retrievedData[0]['COUNT(*)'] === 0) {
        res.send('failed');
      } else {
        res.send('verified');
      }
      await db.close();
    } catch (error) {
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

app.post('/ecommerce/user/new', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  res.type('text');
  if (username === undefined || password === undefined) {
    res.status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let qry = 'INSERT INTO user (username, password) VALUES (?, ?);';
      await db.run(qry, [username, password]);
      res.send('User added!')
      await db.close();
    } catch (error) {
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

app.post('/ecommerce/purchase', async (req, res) => {
  let productName = req.query.productName;

  if (productName === undefined) {
    res.type('text').status(SERVER_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let checkQry = 'SELECT name, quantity, price, id FROM product WHERE name = ?;';
      let updateQry = 'UPDATE product SET quantity = quantity - 1 WHERE name = ?;';

      let checkRes = await db.all(checkQry, productName);
      if (checkRes[0] === undefined) {
        res.type('text').status(CLIENT_ERROR)
          .send('Yikes. Product Name doesn\'t exist!')
      } else {
        if (checkRes[0]['quantity'] === 0) {
          res.type('text').status(CLIENT_ERROR)
            .send('The quantity of the item is 0')
        } else {

          checkRes[0]['quantity'] -= 1;
          await db.run(updateQry, productName);
          res.type('json').send(checkRes[0]);
        }
      }

      await db.close();
    } catch (error) {
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG)
    }
  }
});

app.post('/ecommerce/cart', async (req, res) => {
  let username = req.body.username;
  let productId = parseInt(req.body.productId);
  let quantity = parseInt(req.body.quantity);
  res.type('text');
  if (username === undefined || productId === undefined || quantity === undefined) {
    res.status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let validUserQry = 'Select cartId FROM user WHERE username = ?;';
      let validProductQry = 'Select id FROM product WHERE id = ?;';
      let cartId = await db.all(validUserQry, username);
      let validProduct = await db.all(validProductQry, productId);
      cartId = cartId[0]['cartId'];
      console.log(cartId);
      if (cartId === undefined || validProduct === undefined) {
        res.status(CLIENT_ERROR)
          .send('username doesnt exist.');
      } else {
        let insertQry = 'INSERT INTO shopping (username, productId, cartId, quantity) VALUES (?, ?, ?, ?);';
        
        let retrievedData = await db.run(insertQry, [username, productId, cartId, quantity]);
        
        console.log('lastid:' + retrievedData.lastID);
        res.send((retrievedData.lastID).toString());
      }
      await db.close();
    } catch(error) {
      console.log(error);
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

app.post('/ecommerce/cart/update', async (req, res) => {
  let username = req.query.username;
  res.type('text');
  if (username === undefined) {
    res.status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS)
  } else {
    try {
      let db = await getDBConnection();
      let updateQry = 'UPDATE user SET cartId = cartId + 1 WHERE username = ?';
      await db.run(updateQry, username);
      res.send('updated cart');
      await db.close()
    } catch(error) {
      console.log(error);
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * This function creates a connection to the sqlite database and returns a database object
 * to access the database
 * @returns {Object} a database object which is our connecion to the sqlite database
 */
 async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'semi-final.db',
    // filename: 'max-approach-laptop.db',
    driver: sqlite3.Database
  });

  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || NODE_PORT;
app.listen(PORT);