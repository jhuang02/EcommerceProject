# *Ecommerce* API Documentation
*The Ecommerce API provides manages and accesses data regarding the users and products.*

## Get all product data for a given search term (optional)
**Request Format:** /ecommerce/products

**Query Parameters:** search (optional)

**Request Type:** GET

**Returned Data Format**: JSON

**Description 1:** If neither the productName parameter nor the productId parameter are not included in the request, the endpoint returns a JSON of all the products in the database. The JSON includes data regarding the id, name, quantity, category, and price of each product.

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

**Description 2:** If either the productName or the productId parameter is included in the query of the request, the endpoint returns a JSON that contains the id, name, quantity, price, and category of the product.

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

**Description:** If the username and password body parameters exist in the 'user database', the endpoint returns the text 'verified'.
Otherwise, the endpoint returns the text 'failed'.

**Example Request:** /ecommerce/authentication with body parameters username=Justin, password=12345

**Example Response:**

```
success
```

**Error Handling:**
- Possible 400 (invalid request) error (all plain text):
  - If the username and password query parameters aren't provided, sends an error with the message: 'Yikes. Username doesn't exist!'.
- Possible 500 (server error) error (all plain text):
  - 'An error occurred on the server. Try again later.'

## Add a new user to the ecommerce database
**Request Format:** /ecommerce/user/new

**Body Parameters:** username, password

**Request Type**: POST

**Returned Data Format**: Plain Text

**Description:** The endpoint creates and inserts a new user with the provided body parameters: username, password

**Example Request:** /ecommerce/user/new with body parameters username=Justin, password=12345

**Example Response:**
```
User added!
```

**Error Handling:**
- Possible 400 (invalid request) error (all plain text):
  - If the username already exists in the database, an error is sent with the message: 'User already exists!
- Possible 400 (invalid request) error (all plain text):
  - If the username and password query parameters aren't provided, sends an error with the message: 'Missing one or more of the required params'.
- Possible 500 (server error) error (all plain text):
  - 'An error occurred on the server. Try again later.'

## Purchase a product
**Request Format:** /ecommerce/purchase

**Query Parameters:** item, userId

**Request Type**: POST

**Returned Data Format**: JSON

**Description:** The endpoint adds a new yip to the database and sends back the JSON with the id,
name, yip, hashtag, likes, and date. The id is auto-incremented from inserting into the database.
The name is grabbed from the name body parameter. The likes is set to 0. The yip and hashtag
information is obtained from the full body parameter. The data is the current date which is set
by default upon insert.

**Example Request:** /yipper/new

**Example Response:**

```json
{
  "id": 528,
  "name": "Chewbarka",
  "yip": "love to yip allllll day long",
  "hashtag": "coolkids",
  "likes": 0,
  "date": "2020-09-09 18:16:18"
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If missing the name or the full yip, an error is returned with the message:
  'Missing one or more of the required params.'
  - If passed in an invalid yip that doesn't fulfill the yip regex requirements, an error is
  returned with the message: 'Yikes. Yip format is invalid.'
- Possible 500 (server error) error (all plain text):
  - 'There was an error reading from the activities file!'