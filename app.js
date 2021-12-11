/*
 * Names: Justin Yang, Jerry Huang
 * Date: 12/1/2021
 * Section: CSE 154 AD
 *
 * Description: Our server side code that returns info for requests such as certain products,
 * validating a user, shopping cart, etc in our ecommerce website.
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

/**
 * Endpoint for product data, return all products if no search term is given, or else just give
 * the data for a certain product
 */
app.get('/ecommerce/products', async (req, res) => {
  let productName = req.query.productName;
  let productId = req.query.productId;
  console.log('Parameters: ', productId, productName)
  try {
    let db = await getDBConnection();
    let retrievedData;
    let qry;
    if (productName === undefined && productId === undefined) {
      qry = 'SELECT * FROM product;';
      retrievedData = await db.all(qry);
      res.type('json').send({'products': retrievedData});
    } else {
      if (productName === undefined) {
        qry = 'SELECT * FROM product WHERE id = ?;';
        retrievedData = await db.all(qry, productId);
        res.type('json').send({'products': retrievedData});
      } else if (productId === undefined) {
        qry = 'SELECT * FROM product WHERE name = ?;';
        retrievedData = await db.all(qry, productName);
        res.type('json').send({'products': retrievedData});
      } else {
        res.type('text').status(CLIENT_ERROR)
          .send('Please search using either Product Name or Product ID!')
      }
    }
    
    await db.close();
  } catch (error) {
    res.type('text').status(SERVER_ERROR)
      .send(SERVER_ERROR_MSG);
  }
});

/**
 * Endpoint for checking if the user is valid in the database
 */
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
      let getUsernameQry = 'SELECT name from user WHERE name = ?';
      let retrievedUsername = await db.all(getUsernameQry, username);
      if (retrievedUsername.length === 0) {
        res.status(CLIENT_ERROR)
          .send('Yikes. Username doesn\' exist!');
      } else {
        let qry = 'SELECT COUNT(*) FROM user WHERE username = ? and password = ?';
        let retrievedData = await db.all(qry, [username, password]);
        if (retrievedData[0]['COUNT(*)'] === 0) {
          res.send('failed');
        } else {
          res.send('verified');
        }
      }

      await db.close();
    } catch (error) {
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * Endpoint for when a new user signs up, add their data into the database
 */
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
      if (retrievedProductId.length === 0) {
        res.status(CLIENT_ERROR)
          .send('Yikes. Username doesn\' exist!');
      } else {
        let qry = 'INSERT INTO user (username, password, cartId) VALUES (?, ?, 0);';
        await db.run(qry, [username, password]);
        res.send('User added!')
      }

      await db.close();
    } catch (error) {
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * Endpoint for when a user purchases a product, reduce quantity of item
 */
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

/**
 * Endpoint for adding a product into a shopping cart
 */
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

/**
 * Endpoint for adding a product into a shopping cart
 */
app.post('/ecommerce/cart/update', async (req, res) => {
  let username = req.query.username;
  res.type('text');
  if (username === undefined) {
    res.status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS)
  } else {
    try {
      let db = await getDBConnection();
      let getUsernameQry = 'SELECT name from user WHERE name = ?';
      let retrievedUsername = await db.all(getUsernameQry, username);
      if (retrievedUsername.length === 0) {
        res.status(CLIENT_ERROR)
          .send('Yikes. Username doesn\' exist!');
      } else {
        let updateQry = 'UPDATE user SET cartId = cartId + 1 WHERE username = ?';
        await db.run(updateQry, username);
        res.send('updated cart');
      }

      await db.close()
    } catch (error) {
      console.log(error);
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * Endpoint for getting the order history of a user
 */
app.get('/ecommerce/history', async (req, res) => {
  let username = req.query.username;

  if (username === undefined) {
    res.type('text').status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let getUsernameQry = 'SELECT name from user WHERE name = ?';
      let retrievedUsername = await db.all(getUsernameQry, username);
      if (retrievedUsername.length === 0) {
        res.status(CLIENT_ERROR)
          .send('Yikes. Username doesn\' exist!');
      } else {
        let historyQry = 'SELECT s.cartId, s.quantity, p.name FROM shopping as s JOIN product as p on s.productId = p.id WHERE s.username = ? ORDER BY cartId;';
        let historyRes = await db.all(historyQry, username);
        res.type('json').send({'history': historyRes});
      }

      await db.close();
    } catch (error) {
      console.log(error);
      res.type('text').status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

app.post('/ecommerce/feedback/new', async (req, res) => {
  let productId = req.body.productId;
  let username = req.body.username;
  let rating = req.body.rating;
  let review = req.body.review;

  res.type('text')

  if (username === undefined || rating === undefined || review === undefined || productId === undefined) {
    res.status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let getProductIdQry = 'SELECT id FROM product WHERE id = ?';
      let retrievedProductId = await db.all(getProductIdQry, productId);
      if (retrievedProductId.length === 0) {
        res.status(CLIENT_ERROR)
          .send('Yikes. Product ID doesn\' exist!');
      } else {
        let getUsernameQry = 'SELECT username FROM user WHERE username = ?';
        let retrievedUsername = await db.all(getUsernameQry, username);
        if (retrievedUsername.length === 0) {
          res.status(CLIENT_ERROR)
            .send('Yikes. Username doesn\'t exist!');
        } else {
          let insertFeedbackQry = 'INSERT INTO feedback (productId, username, rating, review) VALUES (?, ?, ?, ?)';
          await db.run(insertFeedbackQry, [productId, username, rating, review]);
          res.send('Successfully inserted feedback!');
        }
      }
      await db.close();
    } catch (error) {
      console.log(error);
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

app.get('/ecommerce/feedback', async (req, res) => {
  let productId = req.query.productId;

  if (productId === 'undefined') {
    res.type('text').status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    let db = await getDBConnection();
    let verifyIdQry = 'SELECT * FROM product WHERE id = ?;';
    let verifyIdRes = await db.run(verifyIdQry, productId);
    if (verifyIdRes.length === 0) {
      res.type('text').status(CLIENT_ERROR)
        .send('Yikes! Product ID does\'t exist.');
    } else {
      let getFeedbackQry = 'SELECT * FROM feedback WHERE productId = ?;';
      let getFeedbackRes = await db.all(getFeedbackQry, productId);
      res.type('json').send(getFeedbackRes[0]);
    }
    await db.close();
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

/** Use files from public folder */
app.use(express.static('public'));

/** Listen on port 8000 */
const PORT = process.env.PORT || NODE_PORT;
app.listen(PORT);