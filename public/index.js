"use strict";

(function() {
  window.addEventListener("load", init);

  const USER = '';
  const PASS = '';

  function init() {
    fetchAllProducts();
    // createShoppingCart();
    changeView('home-view');
    let homeBtn = id('home-btn');
    let viewAccountBtn = id('account-btn');
    let ordersBtn = id('history-btn');
    let submitAccountBtn = id('submit-account-btn');
    let toggleSaveBtn = id('save-user-toggle');
    let cartBtn = id('cart-btn');
    viewAccountBtn.addEventListener('click', viewAccount);
    ordersBtn.addEventListener('click', viewOrders);
    submitAccountBtn.addEventListener('click', authenticate);
    toggleSaveBtn.addEventListener('click', toggleSaveUser);
    homeBtn.addEventListener('click', viewHome);
    cartBtn.addEventListener('click', viewCart);
  }

  function viewHome() {
    changeView('home-view');
  }

  // function createShoppingCart() {
  //   let userCart = {}
  //   if ()
  //   window.localStorage.setItem('cart', userCart);
  // }

  function viewAccount() {
    changeView('account-view');
    prefillUser();
  }
  function viewOrders() {
    changeView('history-view');
  }
  function viewCart() {
    changeView('cart-view');
  }

  function prefillUser() {
    document.getElementById("login-username").value = window.localStorage.getItem('user');
  }

  function toggleSaveUser() {
    let user = window.localStorage.getItem('user');
    if (user === null) {
      let username = id('login-username').value;
      window.localStorage.setItem('user', username);
    } else {
      window.localStorage.removeItem('user');
    }
  }

  function changeView(idOfVisibleView) {
    let allViews = qsa('#ecommerce-data > section');
    allViews.forEach(view => view.classList.add('hidden'));
    let view = id(idOfVisibleView);
    view.classList.remove('hidden');
  }

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
      .then(function(resp) {
        processAuthentication(resp, username, password);
      })
      .catch(handleError);
  }

  function processAuthentication(resp, username, password) {
    if (resp === 'verified') {
      id('incorrect-message').classList.add('hidden');
      window.localStorage.setItem('user', username);
      USER = username;
      PASS = password;
      //more user stuff
    } else {
      id('incorrect-message').classList.remove('hidden');
    }
  }

  function fetchAllProducts() {
    fetch('/ecommerce/products')
      .then(statusCheck)
      .then(res => res.json())
      .then(processAll)
      .catch(handleError);
  }

  /**
   * Process all the random products returned by the server
   * @param {object} response - the product server data for the random products
   */
  function processAll(res) {
    console.log(res);
    res = res['products'];
    for (let i = 0; i < res.length; i++) {
      let productArticle = generateProductArticle(res[i]);
      id("home-view").appendChild(productArticle);
    }
  }

  function generateProductArticle(clothesObject) {
    let name = clothesObject['name'];
    let quantity = clothesObject['quantity'];
    let category = clothesObject['category'];
    let price = clothesObject['price'];

    let article = gen("article");
    let nameElement = gen("p");
    let quantityElement = gen("p");
    let categoryElement = gen("p");
    let priceElement = gen("p");

    nameElement.textContent = name;
    quantityElement.textContent = quantity;
    categoryElement.textContent = category;
    priceElement.textContent = '$' + price;

    article.appendChild(nameElement);
    article.appendChild(quantityElement);
    article.appendChild(categoryElement);
    article.appendChild(priceElement);
    article.classList.add('clothing-item');
    return article;
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