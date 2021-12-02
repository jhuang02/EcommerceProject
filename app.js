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

const NODE_PORT = 8000;
app.use(express.static('public'));
const PORT = process.env.PORT || NODE_PORT;
app.listen(PORT);