CREATE TABLE shopping (
  username INTEGER PRIMARY KEY,
  productId INTEGER,
  cartId INTEGER,
  quantity INTEGER,
  FOREIGN KEY(productid) references product(id)
);

CREATE TABLE user (
  username TEXT PRIMARY KEY,
  password TEXT,
  cartId INTEGER
);

CREATE TABLE product (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quantity INTEGER,
  name TEXT,
  category TEXT,
  price DECIMAL(10, 5)
);

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER,
  username TEXT,
  rating INTEGER,
  reviews TEXT,
  FOREIGN KEY(productid) references product(id),
  FOREIGN KEY(username) references user(username)
);

CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userid INTEGER,
  FOREIGN KEY(userid) references user(id)
);