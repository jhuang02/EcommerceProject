CREATE TABLE cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userid INTEGER,
  FOREIGN KEY(userid) references user(id)
);

-- CREATE TABLE cart_item (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   quantity INTEGER,
--   productid INTEGER,
--   cartid INTEGER,
--   FOREIGN KEY(productid) references product(id),
--   FOREIGN KEY(cartid) references cart(id)
-- );

CREATE TABLE session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userid INTEGER,
  FOREIGN KEY(userid) references user(id)
);

CREATE TABLE shopping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionid INTEGER,
  userid INTEGER,
  productid INTEGER,
  FOREIGN KEY(sessionid) references session(id),
  FOREIGN KEY(userid) references user(id),
  FOREIGN KEY(productid) references product(id)
);

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
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
  cartid INTEGER,
  FOREIGN KEY(userid) references user(id),
  FOREIGN KEY(cartid) references cart(id)
);