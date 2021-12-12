# *Ecommerce* API Documentation
*The Ecommerce API provides manages and accesses data regarding the users and products.*

## Get all product data for a given search term (optional)
**Request Format:** /ecommerce/products

**Query Parameters:** search (optional)

**Request Type:** GET

**Returned Data Format**: JSON

**Description 1:** If neither the productName parameter nor the productId parameter are not
included in the request, the endpoint returns a JSON of all the products in the database. The
JSON includes data regarding the id, name, quantity, category, and price of each product.

**Example Request 1:** /ecommerce/products

**Example Output 1:** (abbreviated)

```json
{
  "products": [
      {
          "id": 1,
          "quantity": 5,
          "name": "blue jeans",
          "category": "pants",
          "price": 45.99
      },
      {
          "id": 2,
          "quantity": 3,
          "name": "denim jacket",
          "category": "coats",
          "price": 59.99
      }
  ]
}
```

**Description 2:** If either the productName or the productId parameter is included in the query
of the request, the endpoint returns a JSON that contains the id, name, quantity, price, and
category of the product.

**Example Request 2:** /ecommerce/products?productName=blue jeans

**Example Output 2:**

```json
{
  "products": [
      {
          "id": 1,
          "quantity": 5,
          "name": "blue jeans",
          "category": "pants",
          "price": 45.99
      }
  ]
}
```

**Error Handling:**
- Possible 400 (client error) error (all plain text):
  - 'Please search using either Product Name or Product ID!'
- Possible 500 (server error) error (all plain text):
  - 'An error occurred on the server. Try again later.'

## Verify if a username, password combination exists in a database
**Request Format:** /ecommerce/authentication

**Body Parameters:** username, password

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** If the username and password body parameters exist in the 'user database',
the endpoint returns the text 'verified'.
Otherwise, the endpoint returns the text 'failed'.

**Example Request:** /ecommerce/authentication with body parameters username=Justin, password=12345

**Example Response:**

```
success
```

**Error Handling:**
- Possible 400 (invalid request) error (all plain text):
  - If the username and password query parameters aren't provided, sends an error with the message:
  'Yikes. Username doesn't exist!'.
- Possible 500 (server error) error (all plain text):
  - 'An error occurred on the server. Try again later.'

## Add a new user to the ecommerce database
**Request Format:** /ecommerce/user/new

**Body Parameters:** username, password

**Request Type**: POST

**Returned Data Format**: Plain Text

**Description:** The endpoint creates and inserts a new user with the provided body parameters:
username, password

**Example Request:** /ecommerce/user/new with body parameters username=Justin, password=12345

**Example Response:**
```
User added!
```

**Error Handling:**
- Possible 400 (invalid request) error (all plain text):
  - If the username already exists in the database, an error is sent with the message:
  'User already exists!
- Possible 400 (invalid request) error (all plain text):
  - If the username and password query parameters aren't provided, sends an error with the message:
  'Missing one or more of the required params'.
- Possible 500 (server error) error (all plain text):
  - 'An error occurred on the server. Try again later.'

## Purchase a product
**Request Format:** /ecommerce/purchase

**Query Parameters:** productId

**Request Type**: POST

**Returned Data Format**: Plain TEXT

**Description:** The endpoint selects the id, name, quantity, and price of the purchased product
from the product table. The endpoint also decrements the quantity of the item from the ecommerce
site in the product table.

**Example Request:** /ecommerce/purchase?productId=1

**Example Response:**

```json
{
    "name": "blue jeans",
    "quantity": 3,
    "price": 45.99,
    "id": 1
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the productId is not provided, the endpoint sends the message:
  'Missing one or more of the required params.'
  - If passed in a productId that does not exist, an error is sent with the message:
  'Yikes. Product Name doesn't exist!'
  - If there are no available products to buy (quantity is 0), an error is sent with the message:
  'The quantity of the item is 0'
- Possible 500 (server error) error (all plain text):
  - 'There was an error reading from the activities file!'

## Adding a product to the shopping cart
**Request Format:** /ecommerce/cart

**Body Parameters:** username, productId, quantity

**Request Type**: POST

**Returned Data Format**: Plain TEXT

**Description:** The endpoint uses the username, productId, quantity, and the cartId of the user
to add an item to the user's currently open shopping cart. If successfull, the last cartId is sent

**Example Request:** /ecommerce/cart with the body parameters
- username: Justin
- productId: 1
- quantity: 1

**Example Response:**

```
2
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If one of the body parameters are not provided, the endpoint sends the message:
  'Missing one or more of the required params.'
  - If passed in a username or product ID that does not exist, an error is sent with the message:
  'Username or product ID doesn't exist in the database.'
- Possible 500 (server error) error (all plain text):
  - 'There was an error reading from the activities file!'

## Updating the cartId in the user table
**Request Format:** /ecommerce/cart/update

**Query Parameters:** username

**Request Type**: POST

**Returned Data Format**: Plain TEXT

**Description:** The endpoint uses the username sent in the request to update the cartId by 1,
signifying that the user has checkout a cart, and a new session/cart needs to be opened.

**Example Request:** /ecommerce/cart?username=Justin

**Example Response:**

```
updated cart
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If one of the query parameters are not provided, the endpoint sends the message:
  'Missing one or more of the required params.'
  - If passed in a username that does not exist, an error is sent with the message:
  'Yikes, Username doesn't exist in the database.'
- Possible 500 (server error) error (all plain text):
  - 'There was an error reading from the activities file!'

## Retrieving the history of transactions of the user
**Request Format:** /ecommerce/history

**Query Parameters:** username

**Request Type**: GET

**Returned Data Format**: JSON

**Description:** The endpoint uses the username sent in the request to retrieve all the
transactions that the user has made.

**Example Request:** /ecommerce/history?username=Justin

**Example Response:**

```json
{
    "history": [
        {
            "cartId": 3,
            "quantity": 1,
            "name": "denim jacket"
        },
        {
            "cartId": 4,
            "quantity": 1,
            "name": "blue jeans"
        },
        {
            "cartId": 4,
            "quantity": 1,
            "name": "blue jeans"
        }
    ]
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If one of the query parameters are not provided, the endpoint sends the message:
  'Missing one or more of the required params.'
  - If passed in a username that does not exist, an error is sent with the message:
  'Yikes, Username doesn't exist!'
- Possible 500 (server error) error (all plain text):
  - 'There was an error reading from the activities file!'

## Adding a new feedback
**Request Format:** /ecommerce/feedback/new

**Body Parameters:** username, productId, rating, review

**Request Type**: POST

**Returned Data Format**: Plain Text

**Description:** The endpoint uses the body parameters to add a new feedback by a user for a
specific product.

**Example Request:** /ecommerce/feedback/new with the body parameters
- username: Justin
- productId: 1
- rating: 4
- review: Excellent material!

**Example Response:**

```
Sucessfully inserted feedback!
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If one of the query parameters are not provided, the endpoint sends the message:
  'Missing one or more of the required params.'
  - If passed in a username or product ID that does not exist, an error is sent with the message:
  'Yikes. Username and/or Product ID doesn't exist!'
- Possible 500 (server error) error (all plain text):
  - 'There was an error reading from the activities file!'

## Getting all Feedback for a product
**Request Format:** /ecommerce/feedback

**Query Parameters:** productId

**Request Type**: GET

**Returned Data Format**: Plain Text

**Description:** The endpoint uses the productId to retrieve all the feedback for the product.

**Example Request:** /ecommerce/feedback?productId=1

**Example Response:**

```json
{
    "feedback": [
        {
            "id": 1,
            "productId": 1,
            "username": "Justin",
            "rating": 1,
            "review": "bad"
        },
        {
            "id": 2,
            "productId": 1,
            "username": "Justin",
            "rating": 3,
            "review": "decent"
        },
        {
            "id": 3,
            "productId": 1,
            "username": "Justin",
            "rating": 4,
            "review": "Fits very well!"
        }
    ]
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If one of the query parameters are not provided, the endpoint sends the message:
  'Missing one or more of the required params.'
  - If passed in a product ID that does not exist, an error is sent with the message:
  'Product doesn't exist!'
- Possible 500 (server error) error (all plain text):
  - 'There was an error reading from the activities file!'