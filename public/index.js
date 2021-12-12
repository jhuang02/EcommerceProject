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
    buttonBehaviorOne();
    buttonBehaviorTwo();
  }

  /**
   * Link buttons with their respective behavior functions
   */
  function buttonBehaviorOne() {
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
  function buttonBehaviorTwo() {
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
        if (productArray[i].lastChild.previousSibling.previousSibling.textContent
          !== capitalize(filter)) {
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
   * * @param {object} resp - the server response for products
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

    let params = new FormData();
    params.append('username', username.value);
    params.append('password', password.value);

    fetch('/ecommerce/user/new', {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then(res => {
        username.value = '';
        password.value = '';
        id('login-view').classList.add('hidden');
        let createdAccountMsg = gen('p');
        qs('main').appendChild(createdAccountMsg);
        createdAccountMsg.textContent = res;
        setTimeout(() => {
          id('login-view').classList.remove('hidden');
          createdAccountMsg.remove();
        }, ONESEC)
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
      changeView('cart-view');
      let cartView = id('cart-view');
      cartView.innerHTML = '';
      let cartText = gen('h2');
      cartText.textContent = "Your Shopping Cart:"
      cartView.appendChild(cartText);
      let userCart = JSON.parse(window.localStorage.getItem(USER));
      if (userCart === null) {
        userCart = {}
      }
      let totalCost = 0;
      Object.keys(userCart).forEach(item => {

        let article = gen('article');
        article.classList.add('cart-product');
        let name = gen('p');
        let qt = gen('p');
        let productPrice = gen('p');
        name.textContent = 'Item: ' + item;
        let itemQuantity = userCart[item]['quantity'];
        let itemPrice = userCart[item]['quantity'] * userCart[item]['price']
        qt.textContent = 'QT: ' + itemQuantity;
        productPrice.textContent = 'Price: ' + itemPrice;
        article.appendChild(name);
        article.appendChild(qt);
        article.appendChild(productPrice);
        totalCost += itemPrice;
        article.classList.add('clothing-item');
        cartView.appendChild(article);
      });
      let priceElement = gen('p');
      let checkoutBtn = gen('button');
      checkoutBtn.textContent = 'Checkout';
      checkoutBtn.addEventListener('click', checkout);
      priceElement.textContent = 'Total Cost: $' + totalCost;
      cartView.append(priceElement);
      cartView.appendChild(checkoutBtn);
    }

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
        .then(res => res.text())
        // what can I do here
        .then()
        .catch(handleError);
    });

    fetch('/ecommerce/cart/update?username=' + USER, {method: "POST"})
      .then(statusCheck)
      .then(res => res.text())
      .then(() => {
        let cartView = id('cart-view');
        window.localStorage.setItem(USER, JSON.stringify({}));
        cartView.innerHTML = '';
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
        }, 1000);
      })
      .catch(handleError);
  }

  /**
   * Switch to account login view
   */
  function viewAccount() {
    if (!USER & !PASS) {
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
    if ((window.localStorage.getItem('user') != null)) {
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
   */
  function processAuthentication(resp, username, password) {
    if (resp === 'verified') {
      id('incorrect-message').classList.add('hidden');
      window.localStorage.setItem('user', username);
      USER = username;
      PASS = password;
      let cart = JSON.parse(window.localStorage.getItem(USER));
      if (cart === null) {
        cart = {}
      }
      window.localStorage.setItem(USER, JSON.stringify(cart));
      //more user stuff
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
   * @param {object} response - the product server data all products
   */
  function processAll(res) {
    res = res['products'];
    for (let i = 0; i < res.length; i++) {
      let productArticle = generateProductArticle(res[i]);
      id("home-view").appendChild(productArticle);
    }
  }

  /**
   * Generate all the articles for each product
   * @param {object} product - the product server data for a product
   */
  function generateProductArticle(product) {
    let name = product['name'];
    let quantity = product['quantity'];
    let category = product['category'];
    let price = product['price'];
    let id = product['id'];

    let article = gen('article');
    let nameElement = gen('p');
    // let quantityElement = gen('p');
    let categoryElement = gen('p');
    let priceElement = gen('p');
    let buyBtn = gen('button');


    nameElement.textContent = capitalize(name);
    // quantityElement.textContent = 'QT: ' + quantity;
    categoryElement.textContent = capitalize(category);
    categoryElement.classList.add('category');
    priceElement.textContent = '$' + price;
    buyBtn.textContent = 'Add to Cart!';

    // test this case later
    buyBtn.addEventListener('click', purchaseItem);
    if (quantity == 0) {
      buyBtn.disabled = true;
    }

    article.appendChild(nameElement);
    // article.appendChild(quantityElement);
    article.appendChild(categoryElement);
    article.appendChild(priceElement);
    article.appendChild(buyBtn);
    article.classList.add('product');
    article.classList.add('clothing-item');
    article.addEventListener('click', viewItem)
    article.id = id;
    return article;
  }

  function viewItem(event) {
    if (event.target.textContent !== 'Add to Cart!') {
      console.log(this)
      PRODUCT_ID = this.id;

      changeView('item-view');
      fetch('/ecommerce/products?productId=' + this.id)
        .then(statusCheck)
        .then(res => res.json())
        .then(populateItemView)
        .catch(handleError);
    }
  }

  function populateItemView(res) {
    res = res['products'][0];

    let nameElement = gen('p');
    let quantityElement = gen('p');
    let categoryElement = gen('p');
    let priceElement = gen('p');
    let buyBtn = gen('button');
    let feedbackElement = gen('article');
    feedbackElement.classList.add('item-view-product');

    nameElement.textContent = 'Name: ' + capitalize(res['name']);
    quantityElement.textContent = 'Quantity: ' + res['quantity'];
    categoryElement.textContent = 'Category: ' + capitalize(res['category']);
    priceElement.textContent = '$' + res['price'];
    buyBtn.textContent = 'Add to Cart!';
    // test this case later
    buyBtn.addEventListener('click', purchaseItem);
    if (res['quantity'] == 0) {
      buyBtn.disabled = true;
    }
    priceElement.textContent = 'Price: ' + res['price'];
    fetch('/ecommerce/feedback?productId=' + res['id'])
      .then(statusCheck)
      .then(res => res.json())
      .then(res => {
        res = res['feedback'];
        res.forEach(item => {
          populateFeedback(item, feedbackElement);
        })
      })
      .catch(handleError);

    let itemView = id('item-section');

    itemView.appendChild(nameElement);
    itemView.appendChild(categoryElement);
    itemView.appendChild(quantityElement);
    itemView.appendChild(priceElement);
    itemView.appendChild(buyBtn);

    itemView.appendChild(feedbackElement);
  }

  function populateFeedback(res, feedbackElement) {
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
    feedbackElement.appendChild(feedbackReview);
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
   */
  function purchaseItem(event) {
    if (USER === undefined) {
      id('home-view').classList.add('hidden');
      let loginFailureMsg = gen('id');
      loginFailureMsg.textContent = 'Log in to add items to the cart!';
      qs('main').appendChild(loginFailureMsg);
      setTimeout(() => {
        loginFailureMsg.remove()
        id('home-view').classList.remove('hidden');
      }, 1000);
    } else {
      let cart = JSON.parse(window.localStorage.getItem(USER));
      let productName = event.target.parentElement.firstElementChild.textContent;
      console.log(productName);
      fetch('/ecommerce/purchase?productName=' + productName.toLowerCase(), {method: 'POST'})
        .then(statusCheck)
        .then(res => res.json())
        .then(res => {
          event.target.parentElement.childNodes[1].textContent = 'QT: ' + res['quantity'];
          if (res['quantity'] == 0) {
            event.target.disabled = true;
          }
          console.log(res)
          if (cart[res['name']] === undefined) {
            let productData = {'quantity' : 1, 'price': res['price'], 'id': res['id']}
            cart[res['name']] = productData;
          } else {
            cart[res['name']]['quantity'] += 1;
          }
          window.localStorage.setItem(USER, JSON.stringify(cart));
        })
        .catch(handleError);
    }
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
    let text = words.split(' ')
    let capitalizedText = ''
    for (let i = 0; i < text.length; i++) {
      capitalizedText += text[i].charAt(0).toUpperCase() + text[i].slice(1) + ' '
    }
    return capitalizedText.trim();
  }

  /**
   * This function executes whenever there is an error in the fetch. A failure message
   * element is appended to the activity description.
   */
  function handleError(error) {
    console.log(error);
    let eccomerceArea = id("ecommerce-data");
    eccomerceArea.innerHTML = "";
    let failureMessage = document.createElement("p");
    failureMessage.textContent = "There was a failure in retrieving data";
    eccomerceArea.appendChild(failureMessage);
  }
})();