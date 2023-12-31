/*
 * Names: Justin Yang, Jerry Huang
 * Date: 12/1/2021
 * Section: CSE 154 AD
 *
 * Description: Our client side code that contains most of the functionality of our ecommerce
 * website. Features our ecommerce site include a view of all products, functionality to filter
 * and search for products, log in, view user order history, and add items to a shopping cart
 */
"use strict";

(function() {
  window.addEventListener("load", init);

  let USER;
  let PASS;
  let PRODUCT_ID;
  const ONESEC = 1000;

  /**
   * Loading UI and listeners once page finishes loading
   */
  function init() {
    fetchAllProducts();
    changeView('home-view');
    addButtonBehaviorOne();
    addButtonBehaviorTwo();
  }

  /**
   * Link buttons with their respective behavior functions
   */
  function addButtonBehaviorOne() {
    let viewAccountBtn = id('account-btn');
    let searchBtn = id('search-btn');
    let searchInput = id('search-term');
    let searchToggleBtn = id('change-search-view-btn');
    let cartBtn = id('cart-btn');
    let submitAccountBtn = id('submit-account-btn');
    let signUpBtn = id('signup');
    let toggleSaveBtn = id('save-user-toggle');
    let backFromItemViewBtn = id('back-btn');
    let logoutBtn = id('logout-btn');
    viewAccountBtn.addEventListener('click', viewAccount);
    searchInput.addEventListener('input', checkSearchEnable);
    searchBtn.addEventListener('click', fetchSearch);
    submitAccountBtn.addEventListener('click', authenticate);
    signUpBtn.addEventListener('click', signup);
    toggleSaveBtn.addEventListener('click', toggleSaveUser);
    searchToggleBtn.addEventListener('click', toggleProductView);
    cartBtn.addEventListener('click', viewCart);
    logoutBtn.addEventListener('click', logout);
    backFromItemViewBtn.addEventListener('click', () => {
      id('item-section').innerHTML = '';
      changeView('home-view');
    });
  }

  /**
   * Link buttons with their respective behavior functions
   */
  function addButtonBehaviorTwo() {
    let homeBtn = id('home-btn');
    let homeToggleBtn = id('change-home-view-btn');
    let homeFilter = id('home-filter');
    let searchFilter = id('search-filter');
    let historyBtn = id('history-btn');
    let feedbackForm = id('feedback-form');
    homeBtn.addEventListener('click', () => changeView('home-view'));
    homeToggleBtn.addEventListener('click', toggleProductView);
    homeFilter.addEventListener('change', () => filterView('home-filter'));
    searchFilter.addEventListener('change', () => filterView('search-filter'));
    historyBtn.addEventListener('click', viewHistory);
    feedbackForm.addEventListener('submit', submitFeedback);
  }

  /**
   * This function retrieves the feedback information and uses a fetch call to send the infromation
   * to the sqlite database
   * @param {Object} event is the event that occurs when the feedback is submitted
   */
  function submitFeedback(event) {
    event.preventDefault();
    let rating = id('rating').value;
    let review = id('review').value;

    let params = new FormData();
    params.append('username', USER);
    params.append('productId', PRODUCT_ID);
    params.append('rating', rating);
    params.append('review', review);

    fetch('/ecommerce/feedback/new', {method: 'POST', body: params})
      .then(statusCheck)
      .then(() => {
        id('rating').value = '';
        id('review').value = '';
      })
      .catch(handleError);
  }

  /**
   * Toggle between lazy and compact views
   */
  function toggleProductView() {
    let productArray = qsa('.product');
    for (let i = 0; i < productArray.length; i++) {
      productArray[i].classList.toggle('compact');
    }
  }

  /**
   * Add filter functionality based on a dropdown for which products to show
   * @param {string} view - the view where the filter functionality should apply
   */
  function filterView(view) {
    let filter = id(view).value;
    let productArray = qsa('.product');
    for (let i = 0; i < productArray.length; i++) {
      productArray[i].classList.remove('hidden');
    }

    if (filter !== 'all') {
      for (let i = 0; i < productArray.length; i++) {
        if (productArray[i].lastChild.previousSibling.previousSibling.textContent !==
          capitalize(filter)) {
          productArray[i].classList.add('hidden');
        }
      }
    }
  }

  /**
   * Add filter functionality based on a dropdown for which products to show
   * @param {string} view - the view where the filter functionality should apply
   */
  function logout() {
    USER = null;
    PASS = null;
    document.getElementById("login-username").value = '';
    document.getElementById("login-password").value = '';
    window.localStorage.removeItem('user');
    id('save-user-toggle').checked = false;
    changeView('login-view');
  }

  /**
   * Change to the history view if logged in and fetch user order history
   */
  function viewHistory() {
    if (!USER || !PASS) {
      changeView('history-not-logged-view');
    } else {
      changeView('history-view');
      fetch('/ecommerce/history?username=' + USER)
        .then(statusCheck)
        .then(res => res.json())
        .then(populateHistoryView)
        .catch(handleError);
    }
  }

  /**
   * Change to the history view if logged in and fetch user order history
   * @param {object} res - the data to populate the history view with
   */
  function populateHistoryView(res) {
    let history = id('history-view');
    id('history-view').innerHTML = '';
    let historyTitle = gen('h2');
    historyTitle.textContent = 'Order History:';
    history.appendChild(historyTitle);
    res = res['history'];
    let cartId;
    let orderElement = gen('article');
    orderElement.classList.add('cart');
    res.forEach(item => {
      if (cartId !== item['cartId']) {
        id('history-view').appendChild(orderElement);
        orderElement = gen('article');
        orderElement.classList.add('cart');
        let cartIdElement = gen('p');
        cartIdElement.textContent = 'Confirmation Number: ' + item['cartId'];
        orderElement.appendChild(cartIdElement);
        cartId = item['cartId'];
      }
      createOrderElement(item, orderElement);
    });

    history.appendChild(orderElement);
  }

  /**
   * Finish appending and creating order element
   * @param {object} item - the item data to use in the order element
   * @param {object} orderElement - the element to finish creating
   */
  function createOrderElement(item, orderElement) {
    let itemElement = gen('section');
    itemElement.classList.add('history-item');
    let itemNameElement = gen('p');
    let itemQuantityElement = gen('p');
    itemNameElement.textContent = 'Name: ' + item['name'];
    itemQuantityElement.textContent = 'Quantity: ' + item['quantity'];
    itemElement.appendChild(itemNameElement);
    itemElement.appendChild(itemQuantityElement);
    itemElement.classList.add('clothing-item');
    orderElement.appendChild(itemElement);
  }

  /**
   * Fetch search product data from server
   */
  function fetchSearch() {
    let searchTerm = id('search-term').value;
    fetch('/ecommerce/products?productName=' + searchTerm.toLowerCase())
      .then(statusCheck)
      .then(resp => resp.json())
      .then(processSearch)
      .catch(handleError);
  }

  /**
   * Process the server response for products matching the search term
   * @param {object} resp - the server response for products
   */
  function processSearch(resp) {
    let searchTerm = id('search-term');
    searchTerm.value = '';

    let results = id('result-container');
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }

    resp = resp.products;
    for (let i = 0; i < resp.length; i++) {
      let productArticle = generateProductArticle(resp[i]);
      results.appendChild(productArticle);
    }
    changeView('search-view');
  }

  /**
   * Signup and add new user to the server to be added to the database
   */
  function signup() {
    let username = id('signup-username');
    let password = id('signup-password');
    let email = id('signup-email');

    let params = new FormData();
    params.append('username', username.value);
    params.append('password', password.value);
    params.append('email', email.value);

    fetch('/ecommerce/user/new', {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then(res => {
        username.value = '';
        password.value = '';
        email.value = '';
        id('login-view').classList.add('hidden');
        let createdAccountMsg = gen('p');
        qs('main').appendChild(createdAccountMsg);
        createdAccountMsg.textContent = res;
        setTimeout(() => {
          id('login-view').classList.remove('hidden');
          createdAccountMsg.remove();
        }, ONESEC);
      })
      .catch(handleError);
  }

  /**
   * If user is logged in, view their shopping cart
   */
  function viewCart() {
    if (!USER || !PASS) {
      changeView('cart-not-logged-view');
    } else {
      appendCart();
    }
  }

  /**
   * This function switches the view to the shopping cart view and displays all the items that
   * are currently in the cart
   */
  function appendCart() {
    changeView('cart-view');
    let cartView = id('cart-view');
    cartView.innerHTML = '';
    let cartText = gen('h2');
    cartText.textContent = "Your Shopping Cart:";
    cartView.appendChild(cartText);
    let userCart = JSON.parse(window.localStorage.getItem(USER));
    if (userCart === null) {
      userCart = {};
    }
    let totalCost = 0;
    Object.keys(userCart).forEach(item => {
      createCartItem(item, userCart);
      totalCost += userCart[item]['quantity'] * userCart[item]['price'];
    });
    finishCartView(totalCost, cartView, totalCost);
  }

  /**
   * This function creates the HTML element that represents an item in the shopping cart
   * @param {String} item - is the name of an item in the shopping cart
   * @param {String} userCart - the userCart element
   */
  function createCartItem(item, userCart) {
    let article = gen('article');
    let cartView = id('cart-view');
    article.classList.add('cart-product');
    let name = gen('p');
    let qt = gen('p');
    let productPrice = gen('p');
    name.textContent = 'Item: ' + item;
    let itemQuantity = userCart[item]['quantity'];
    let itemPrice = userCart[item]['quantity'] * userCart[item]['price'];
    qt.textContent = 'QT: ' + itemQuantity;
    productPrice.textContent = 'Price: ' + itemPrice;
    article.appendChild(name);
    article.appendChild(qt);
    article.appendChild(productPrice);
    article.classList.add('clothing-item');
    cartView.appendChild(article);
  }

  /**
   * Finish appending info to cart view
   * @param {string} totalCost - total cost in the cart
   * @param {object} cartView - cart view element
   */
  function finishCartView(totalCost, cartView) {
    let priceElement = gen('p');
    let checkoutBtn = gen('button');
    checkoutBtn.textContent = 'Checkout';
    checkoutBtn.addEventListener('click', checkout);
    priceElement.textContent = 'Total Cost: $' + totalCost;
    cartView.append(priceElement);
    cartView.appendChild(checkoutBtn);
  }

  /**
   * User checksout their items, adding it to their order history and removing the item from the
   * inventory database
   */
  function checkout() {
    let cart = JSON.parse(window.localStorage.getItem(USER));

    Object.keys(cart).forEach(item => {
      let params = new FormData();
      params.append('username', USER);
      params.append('productId', cart[item]['id']);
      params.append('quantity', cart[item]['quantity']);
      fetch('/ecommerce/cart', {method: 'POST', body: params})
        .then(statusCheck)
        .catch(handleError);
    });

    processCart();
  }

  /**
   * This function updates the cartId of the user and resets the current cart/session. It also
   * updates the HTML to become a blank shopping cart.
   */
  function processCart() {
    fetch('/ecommerce/cart/update?username=' + USER, {method: "POST"})
      .then(statusCheck)
      .then(res => res.text())
      .then(() => {
        let cartView = id('cart-view');
        cartView.innerHTML = '';
        window.localStorage.setItem(USER, JSON.stringify({}));
        let successfullTransaction = gen('p');
        successfullTransaction.textContent = 'Transaction was successfull';
        qs('main').appendChild(successfullTransaction);
        setTimeout(() => {
          let priceElement = gen('p');
          let checkoutBtn = gen('button');
          checkoutBtn.textContent = 'Checkout';
          checkoutBtn.addEventListener('click', checkout);
          priceElement.textContent = 'total cost: $0';
          cartView.append(priceElement);
          cartView.appendChild(checkoutBtn);
          successfullTransaction.remove();
        }, ONESEC);
      })
      .catch(handleError);
  }

  /**
   * Switch to account login view
   */
  function viewAccount() {
    if (!USER || !PASS) {
      changeView('login-view');
      prefillUser();
    } else {
      changeView('login-success-view');
    }
  }

  /**
   * Switch to log in success view if successfully logged in
   */
  function viewLoginSuccess() {
    changeView('login-success-view');
  }

  /**
   * Fill user name input box if user toggles save username feature
   */
  function prefillUser() {
    document.getElementById("login-username").value = window.localStorage.getItem('user');
    if (!(window.localStorage.getItem('user') === null)) {
      id('save-user-toggle').checked = true;
    }
  }

  /**
   * Save username if user toggles this feature
   */
  function toggleSaveUser() {
    let toggleBtn = id('save-user-toggle');
    if (toggleBtn.checked) {
      let username = id('login-username').value;
      window.localStorage.setItem('user', username);
    } else {
      window.localStorage.removeItem('user');
    }
  }

  /**
   * Change to a certain view
   * @param {string} idOfVisibleView - the view to switch to
   */
  function changeView(idOfVisibleView) {
    let allViews = qsa('#ecommerce-data > section');
    allViews.forEach(view => view.classList.add('hidden'));
    let view = id(idOfVisibleView);
    view.classList.remove('hidden');
  }

  /**
   * Check if user log in is valid
   */
  function authenticate() {
    // implement behavior for signing up
    let username = id('login-username').value;
    let password = id('login-password').value;
    let data = new FormData();
    data.append("username", username);
    data.append("password", password);
    fetch('/ecommerce/authentication', {method: "POST", body: data})
      .then(statusCheck)
      .then(resp => resp.text())
      .then(resp => processAuthentication(resp, username, password))
      .catch(handleError);
  }

  /**
   * If user log in isn't valid, display message, if valid, log them in
   * @param {object} resp - the servers response data for logging in user
   * @param {string} username - username
   * @param {string} password - password
   */
  function processAuthentication(resp, username, password) {
    if (resp === 'verified') {
      id('incorrect-message').classList.add('hidden');
      window.localStorage.setItem('user', username);
      window.localStorage.setItem('isLoggedIn', 'true');
      USER = username;
      PASS = password;
      let cart = JSON.parse(window.localStorage.getItem(USER));
      if (cart === null) {
        cart = {};
      }
      window.localStorage.setItem(USER, JSON.stringify(cart));

      viewLoginSuccess();
    } else {
      id('incorrect-message').classList.remove('hidden');
    }
  }

  /**
   * Fetch server data for all the products
   */
  function fetchAllProducts() {
    fetch('/ecommerce/products')
      .then(statusCheck)
      .then(res => res.json())
      .then(processAll)
      .catch(handleError);
  }

  /**
   * Process all the random products returned by the server
   * @param {object} res - the product server data all products
   */
  function processAll(res) {
    window.localStorage.setItem('isLoggedIn', 'false');
    res = res['products'];
    for (let i = 0; i < res.length; i++) {
      let productArticle = generateProductArticle(res[i]);
      id("home-view").appendChild(productArticle);
    }
  }

  /**
   * Generate all the articles for each product
   * @param {object} product - the product server data for a product
   * @returns {object} - the product article
   */
  function generateProductArticle(product) {
    let name = product['name'];
    let quantity = product['quantity'];
    let category = product['category'];
    let price = product['price'];
    let id = product['id'];

    let article = gen('article');
    let nameElement = gen('p');

    let categoryElement = gen('p');
    let priceElement = gen('p');
    let buyBtn = gen('button');

    nameElement.textContent = capitalize(name);

    categoryElement.textContent = capitalize(category);
    categoryElement.classList.add('category');
    priceElement.textContent = '$' + price;
    buyBtn.textContent = 'Add to Cart!';

    buyBtn.addEventListener('click', purchaseItem);
    if (quantity === 0) {
      buyBtn.disabled = true;
    }

    article.appendChild(nameElement);
    article.appendChild(categoryElement);
    article.appendChild(priceElement);
    article.appendChild(buyBtn);
    article.classList.add('product');
    article.classList.add('clothing-item');
    article.addEventListener('click', viewItem);
    nameElement.id = id;
    return article;
  }

  /**
   * Switch to item view and load product data
   * @param {object} event - the event triggering the item view load
   */
  function viewItem(event) {
    if (event.target.textContent !== 'Add to Cart!') {
      PRODUCT_ID = this.firstElementChild.id;

      changeView('item-view');
      fetch('/ecommerce/products?productId=' + this.firstElementChild.id)
        .then(statusCheck)
        .then(res => res.json())
        .then(populateItemView)
        .catch(handleError);
    }
  }

  /**
   * Populate item view with product data
   * @param {object} res - the server response
   */
  function populateItemView(res) {
    id('item-section').innerHTML = '';
    id('review-section').innerHTML = '';
    res = res['products'][0];
    let nameElement = gen('p');
    let quantityElement = gen('p');
    let categoryElement = gen('p');
    let priceElement = gen('p');
    let buyBtn = gen('button');

    nameElement.textContent = 'Name: ' + capitalize(res['name']);
    nameElement.id = res['id'];
    quantityElement.textContent = 'Quantity: ' + res['quantity'];
    categoryElement.textContent = 'Category: ' + capitalize(res['category']);
    priceElement.textContent = '$' + res['price'];
    buyBtn.textContent = 'Add to Cart!';

    buyBtn.addEventListener('click', purchaseItem);
    if (res['quantity'] === 0) {
      buyBtn.disabled = true;
    }
    priceElement.textContent = 'Price: ' + res['price'];

    let feedbackElement = gen('article');
    populateFeedbackElement(feedbackElement, res['id']);
    appendItemChildren(nameElement, categoryElement, quantityElement, priceElement, buyBtn,
                         feedbackElement);

    if (window.localStorage.getItem('isLoggedIn') === 'true') {
      id('feedback-form').classList.remove('hidden');
    }
  }

  /**
   * This function retrieves all the feedbacks for a product and creates an HTML element for each
   * feedback that is appeneded to the Feedback Element (element that holds all the feedback)
   * @param {Object} feedbackElement is the HTML element that represents the feedbacks from the
   * users
   */
  function populateFeedbackElement(feedbackElement, id) {
    feedbackElement.classList.add('item-view-product');
    fetch('/ecommerce/feedback?productId=' + id)
      .then(statusCheck)
      .then(res => res.json())
      .then(res => {
        res = res['feedback'];
        res.forEach(item => {
          populateFeedback(item, feedbackElement);
        })
      })
      .catch(handleError);
  }

  /**
   * Append children on item element
   * @param {object} nameElement - name element
   * @param {object} categoryElement - category element
   * @param {object} quantityElement - quantity element
   * @param {object} priceElement - price element
   * @param {object} buyBtn - buy btn element
   * @param {object} feedbackElement - feedback element
   */
  function appendItemChildren(
    nameElement,
    categoryElement,
    quantityElement,
    priceElement,
    buyBtn,
    feedbackElement) {
    let itemView = id('item-section');
    itemView.appendChild(nameElement);
    itemView.appendChild(categoryElement);
    itemView.appendChild(quantityElement);
    itemView.appendChild(priceElement);
    itemView.appendChild(buyBtn);
    itemView.appendChild(feedbackElement);
  }

  /**
   * Populate feedback view
   * @param {object} res - server feedback response
   * @param {object} feedbackElement - feedback element
   */
  function populateFeedback(res, feedbackElement) {
    let reviewSection = id('review-section');
    let feedbackReview = gen('article');
    feedbackReview.classList.add('feedback');
    let reviewTitle = gen('p');
    let ratingElement = gen('p');
    let reviewElement = gen('p');
    let usernameElement = gen('p');
    reviewTitle.textContent = 'Reviews:';
    feedbackElement.appendChild(reviewTitle);
    ratingElement.textContent = res['rating'];
    reviewElement.textContent = res['review'];
    usernameElement.textContent = res['username'];
    feedbackReview.appendChild(usernameElement);
    feedbackReview.appendChild(ratingElement);
    feedbackReview.appendChild(reviewElement);
    reviewSection.appendChild(reviewTitle);
    reviewSection.appendChild(feedbackReview);
  }

  /**
   * Check if the search button should be enabled. The button should only be able to be
   * pressed when there is non whitespace text in the search box
   */
  function checkSearchEnable() {
    let search = id("search-btn");
    let input = id("search-term").value;
    if (input.trim() === "") {
      search.disabled = true;
    } else {
      search.disabled = false;
    }
  }

  /**
   * Purchase item and add it to the user's order history
   * @param {Object} event is the event that occurs when the buy button is clicked
   */
  function purchaseItem(event) {
    if (USER === undefined) {
      id('home-view').classList.add('hidden');
      let loginFailureMsg = gen('id');
      loginFailureMsg.textContent = 'Log in to add items to the cart!';
      qs('main').appendChild(loginFailureMsg);
      setTimeout(() => {
        loginFailureMsg.remove();
        id('home-view').classList.remove('hidden');
      }, ONESEC);
    } else {
      processItem(event);
    }
  }

  /**
   * This function updates the HTML and calls a fetch to purchase a product from the database
   * @param {Object} event is the event that occurs when the buy button is clicked
   */
  function processItem(event) {
    let cart = JSON.parse(window.localStorage.getItem(USER));
    let productId = event.target.parentElement.firstElementChild.id;
    fetch('/ecommerce/purchase?productId=' + productId, {method: 'POST'})
      .then(statusCheck)
      .then(res => res.json())
      .then(res => {
        if (event.target.parentElement.id === 'item-section') {
          event.target.parentElement.childNodes[2].textContent = 'Quantity: ' + res['quantity'];
        }
        if (res['quantity'] === 0) {
          event.target.disabled = true;
        }
        if (cart[res['name']] === undefined) {
          let productData = {'quantity' : 1, 'price': res['price'], 'id': res['id']};
          cart[res['name']] = productData;
        } else {
          cart[res['name']]['quantity'] += 1;
        }
        window.localStorage.setItem(USER, JSON.stringify(cart));
      })
      .catch(handleError);
  }

  /**
   * Returns the DOM object matching the ID given
   * @param {string} name - name of HTML element ID
   * @returns {object} - DOM object matching name
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns the DOM object matching CSS query given
   * @param {string} selector - name of CSS query
   * @returns {object} - DOM object matching CSS query
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of all DOM object matching CSS query given
   * @param {string} selector - name of CSS query
   * @returns {array} - array of all DOM object matching CSS query
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Generates HTML with provided tagName into DOM
   * @param {string} tagName - name of HTML tag
   * @returns {element} - new DOM object
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * This function checks the status of the response to make sure that the
   * server responded with an OK
   * @param {Object} res is a promise object
   * @returns {Object} another Promise object with the response as the value of the Promise or
   * throws an error if the response is not ok
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * This function capitalizes the first letter of a chunk of text
   * @param {string} words the text to capitalize
   * @returns {string} the capitalized string
   */
  function capitalize(words) {
    let text = words.split(' ');
    let capitalizedText = '';
    for (let i = 0; i < text.length; i++) {
      capitalizedText += text[i].charAt(0).toUpperCase() + text[i].slice(1) + ' ';
    }
    return capitalizedText.trim();
  }

  /**
   * This function executes whenever there is an error in the fetch. A failure message
   * element is appended to the activity description.
   */
  function handleError() {
    let eccomerceArea = id("ecommerce-data");
    eccomerceArea.innerHTML = "";
    let failureMessage = document.createElement("p");
    failureMessage.textContent = "There was a failure in retrieving data";
    eccomerceArea.appendChild(failureMessage);
    qsa('button').forEach(btn => {
      btn.disabled = true;
    });
  }
})();