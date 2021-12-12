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
  try {
    let db = await getDBConnection();
    let retrievedData;
    let qry;
    if (productName === undefined && productId === undefined) {
      qry = 'SELECT * FROM product;';
      retrievedData = await db.all(qry);
      res.type('json').send({'products': retrievedData});
    } else if (productName === undefined) {
      qry = 'SELECT * FROM product WHERE id = ?;';
      retrievedData = await db.all(qry, productId);
      res.type('json').send({'products': retrievedData});
    } else if (productId === undefined) {
      qry = 'SELECT * FROM product WHERE name = ?;';
      retrievedData = await db.all(qry, productName);
      res.type('json').send({'products': retrievedData});
    } else {
        res.type('text').status(CLIENT_ERROR)
          .send('Please search using either Product Name or Product ID!');
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
  let params = [req.body.username, req.body.password];
  if (!checkValidParams(params)) {
    res.type('text').status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let isUsernameInDatabase = await checkUsernameInDatabase(req.body.username);
      if (isUsernameInDatabase === 1) {
        let qry = 'SELECT COUNT(*) FROM user WHERE username = ? and password = ?';
        let retrievedData = await db.all(qry, params);
        if (retrievedData[0]['COUNT(*)'] === 0) {
          res.type('text').send('failed');
        } else {
          res.type('text').send('verified');
        }
      } else if (isUsernameInDatabase === -1) {
        res.type('text').status(CLIENT_ERROR)
          .send('Yikes. Username doesn\'t exist!');
      } else {
        res.type('text').status(SERVER_ERROR)
          .send(SERVER_ERROR_MSG);
      }
      await db.close();
    } catch (error) {
      res.type('text').status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * Endpoint for when a new user signs up, add their data into the database
 */
app.post('/ecommerce/user/new', async (req, res) => {
  let params = [req.body.username, req.body.password, req.body.email];
  res.type('text');
  if (!checkValidParams(params)) {
    res.status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let checkDuplicateUsernameQry = 'SELECT * FROM user WHERE LOWER(username) = ?';
      let checkDuplicateUsernameRes = await db.all(checkDuplicateUsernameQry,
                                                   req.body.username.toLowerCase());
      if (checkDuplicateUsernameRes.length === 1) {
        res.status(SERVER_ERROR)
          .send('User already exists!');
      } else {
        let qry = 'INSERT INTO user (username, password, cartId, email) VALUES (?, ?, 0, ?);';
        await db.run(qry, params);
        res.send('User added!');
        await db.close();
      }

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
  let params = [req.query.productId];
  if (!checkValidParams(params)) {
    res.type('text').status(SERVER_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let checkQry = 'SELECT name, quantity, price, id FROM product WHERE id = ?;';
      let updateQry = 'UPDATE product SET quantity = quantity - 1 WHERE id = ?;';

      let checkRes = await db.all(checkQry, req.query.productId);
      if (checkRes[0] === undefined) {
        res.type('text').status(CLIENT_ERROR)
          .send('Yikes. Product Name doesn\'t exist!')
      } else {
        if (checkRes[0]['quantity'] === 0) {
          res.type('text').status(CLIENT_ERROR)
            .send('The quantity of the item is 0')
        } else {

          checkRes[0]['quantity'] -= 1;
          await db.run(updateQry, req.query.productId);
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
  let params = [req.body.username, req.body.productId, req.body.quantity];
  res.type('text');
  if (!checkValidParams(params)) {
    res.status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let validUserQry = 'Select cartId FROM user WHERE username = ?;';
      let validProductQry = 'Select id FROM product WHERE id = ?;';
      let cartId = await db.all(validUserQry, req.body.username);
      let validProduct = await db.all(validProductQry, req.body.productId);
      params.splice(2, 0, cartId[0]['cartId']);
      if (cartId === undefined || validProduct === undefined) {
        res.status(CLIENT_ERROR)
          .send('Username or product ID doesn\'t exist in the database.');
      } else {
        let insertQry = 'INSERT INTO shopping (username, productId, cartId, quantity) ' +
                        'VALUES (?, ?, ?, ?);';
        let retrievedData = await db.run(insertQry, params);
        res.send((retrievedData.lastID).toString());
      }
      await db.close();
    } catch(error) {
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * Endpoint for adding a product into a shopping cart
 */
app.post('/ecommerce/cart/update', async (req, res) => {
  let params = [req.query.username];
  res.type('text');
  if (!checkValidParams(params)) {
    res.status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS)
  } else {
    try {
      let db = await getDBConnection();
      let isUsernameInDatabase = await checkUsernameInDatabase(req.query.username);
      if (isUsernameInDatabase === -1) {
        res.status(CLIENT_ERROR)
          .send('Yikes. Username doesn\'t exist!');
      } else if (isUsernameInDatabase == 1) {
        let updateQry = 'UPDATE user SET cartId = cartId + 1 WHERE username = ?';
        await db.run(updateQry, req.query.username);
        res.send('updated cart');
      } else {
        res.status(SERVER_ERROR)
          .send(SERVER_ERROR_MSG);
      }

      await db.close()
    } catch (error) {
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * Endpoint for getting the order history of a user
 */
app.get('/ecommerce/history', async (req, res) => {
  let params = [req.query.username];
  if (!checkValidParams(params)) {
    res.type('text').status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let isUsernameInDatabase = await checkUsernameInDatabase(req.query.username);
      if (isUsernameInDatabase === -1) {
        res.type('text').status(CLIENT_ERROR)
          .send('Yikes. Username doesn\'t exist!');
      } else if (isUsernameInDatabase === 1) {
        let historyQry = 'SELECT s.cartId, s.quantity, p.name FROM shopping as s JOIN product as ' +
                        'p on s.productId = p.id WHERE s.username = ? ORDER BY cartId;';
        let historyRes = await db.all(historyQry, params);
        res.type('json').send({'history': historyRes});
      } else {
        res.type('text').status(SERVER_ERROR)
          .send(SERVER_ERROR_MSG);
      }
      await db.close();
    } catch (error) {
      res.type('text').status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * Endpoint to add new feedback for a product
 */
app.post('/ecommerce/feedback/new', async (req, res) => {
  let params = [req.body.productId, req.body.username, req.body.rating, req.body.review];
  if (!checkValidParams(params)) {
    res.type('text').status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let isProductInDatabase = await checkProductInDatabase(req.body.productId);
      let isUsernameInDatabase = await checkUsernameInDatabase(req.body.username);
      if (isUsernameInDatabase === 1 && isProductInDatabase === 1) {
        let insertFeedbackQry = 'INSERT INTO feedback (productId, username, ' +
                                'rating, review) VALUES (?, ?, ?, ?)';
        await db.run(insertFeedbackQry, params);
        res.type('text').send('Successfully inserted feedback!');
      } else if (isUsernameInDatabase === 0 || isProductInDatabase == 0) {
        res.type('text').status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
      } else {
        res.type('text').status(CLIENT_ERROR)
          .send('Yikes. Username and/or Product ID doesn\'t exist!');
      }
      await db.close();
    } catch (error) {
      res.type('text').status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * endpoint to retrieve all the feedbacks for a product
 */
app.get('/ecommerce/feedback', async (req, res) => {
  let productId = req.query.productId;

  if (productId === 'undefined') {
    res.type('text').status(CLIENT_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let isProductInDatabase = await checkProductInDatabase(productId);
      if (isProductInDatabase === 1) {
        let getFeedbackQry = 'SELECT * FROM feedback WHERE productId = ?;';
        let getFeedbackRes = await db.all(getFeedbackQry, productId);
        res.type('json').send({'feedback': getFeedbackRes});
      } else if (isProductInDatabase === -1) {
        res.type('text').send('Product doesn\'t exist in Database');
      } else {
        res.status(SERVER_ERROR)
          .send(SERVER_ERROR_MSG);
      }
      await db.close();
    } catch (error) {
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * This function verifies that all the parameters in a request are valid and non-undefined
 * @param {Object} params is an array of the all the parameters from requests
 * @returns {boolean}
 * - true if and only if all the params have non-undefined values.
 * - Otherwise, false.
 */
function checkValidParams(params) {
  params.forEach(param => {
    if (param === undefined) {
      return false;
    }
  });
  return true;
}

/**
 * This function checks that the username of the user sending the request exists
 * in the database
 * @param {string} username is the username of the user sending the request
 * @returns {integer}
 * - 1 if the username exists in the database
 * - -1 if the username doesn't exist in the databse
 * - 0 if there was an internal 500 server error
 */
async function checkUsernameInDatabase(username) {
  try {
    let isUsernameInDatabase = -1;

    let db = await getDBConnection();
    let getUsernameQry = 'SELECT username FROM user WHERE username = ?';
    let retrievedUsername = await db.all(getUsernameQry, username);
    if (retrievedUsername.length !== 0) {
      isUsernameInDatabase = 1;
    }
    await db.close();
    return isUsernameInDatabase;
  } catch (error) {
    return 0;
  }
}

/**
 * This function checks that the productId of the product exists
 * in the database
 * @param {string} product is the id of the product being sent in the the request
 * @returns {integer}
 * - 1 if the product exists in the database
 * - -1 if the product doesn't exist in the databse
 * - 0 if there was an internal 500 server error
 */
async function checkProductInDatabase(product) {
  try {
    let isProductInDatabase = -1;

    let db = await getDBConnection();
    let getProductQry = 'SELECT id FROM product WHERE id = ?';
    let retrievedProduct = await db.all(getProductQry, product);
    if (retrievedProduct.length !== 0) {
      isProductInDatabase = 1;
    }
    await db.close();
    return isProductInDatabase;
  } catch (error) {
    return 0;
  }
}

/**
 * This function creates a connection to the sqlite database and returns a database object
 * to access the database
 * @returns {Object} a database object which is our connecion to the sqlite database
 */
 async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'ecommerce.db',
    driver: sqlite3.Database
  });

  return db;
}

/** Use files from public folder */
app.use(express.static('public'));

/** Listen on port 8000 */
const PORT = process.env.PORT || NODE_PORT;
app.listen(PORT);