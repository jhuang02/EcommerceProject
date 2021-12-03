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
  if (searchId === undefined) {
    res.type('text').send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let qry;
      let retrievedData;
      if (searchId === undefined) {
        qry = 'SELECT * FROM product;';
        retrievedData = await db.all(qry);
      } else {
        qry = 'SELECT * FROM product WHERE id = ?;';
        retrievedData = await db.all(qry, searchId);
      }
      res.type('json').send({'products': retrievedData});
      await db.close();
    } catch (error) {
      res.type('text').status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

app.get('/ecommerce/authentication', async (req, res) => {
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
        res.send('confirmed');
      }
      await db.close();
    } catch (error) {
      res.status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG);
    }
  }
});

app.post('/ecommerce/purchase', async (req, res) => {
  let item = req.query.item;
  if (item === undefined) {
    res.type('text').status(SERVER_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let qry = 'Update cart_item SET quantity = quantity + 1';
    } catch (error) {
      res.type('text').status(SERVER_ERROR)
        .send(SERVER_ERROR_MSG)
    }
  }
});

app.post('/ecommerce/cart', async (req, res) => {
  let userId = parseInt(req.query.id);
  res.type('text');
  if (userId === undefined) {
    res.status(SERVER_ERROR)
      .send(INVALID_PARAMETERS);
  } else {
    try {
      let db = await getDBConnection();
      let validUserQry = 'Select id FROM user WHERE id = ?;';
      console.log('1');
      let validUser = await db.all(validUserQry, userId);
      if (validUser[0] === undefined) {
        res.status(CLIENT_ERROR)
          .send('user ID doesnt exist.');
      } else {
        let insertQry = 'INSERT INTO cart (userid, status) VALUES (?, "current");';
        let retrievedData = await db.run(insertQry, userId);
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
 * This function creates a connection to the sqlite database and returns a database object
 * to access the database
 * @returns {Object} a database object which is our connecion to the sqlite database
 */
 async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'test7.db',
    driver: sqlite3.Database
  });

  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || NODE_PORT;
app.listen(PORT);