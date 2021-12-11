CREATE TABLE shopping (
  username INTEGER,
  productId INTEGER,
  cartId INTEGER,
  quantity INTEGER,
  FOREIGN KEY(productid) references product(id)
);

CREATE TABLE user (
  username TEXT,
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
  productid INTEGER,
  rating INTEGER,
  count INTEGER,
  reviews TEXT,
  FOREIGN KEY(productid) references product(id)
);

CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userid INTEGER,
  FOREIGN KEY(userid) references user(id)
);