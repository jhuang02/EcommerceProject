"use strict";

(function() {
  window.addEventListener("load", init);

  function init() {
    fetchExploreRandomProducts();
    // createShoppingCart();
    changeView('home-view');

    let viewAccountBtn = id('account-btn');
    let homeBtn = id('home-btn');
    let submitAccountBtn = id('submit-account-btn');
    viewAccountBtn.addEventListener('click', viewAccount);
    submitAccountBtn.addEventListener('click', authenticate);
    homeBtn.addEventListener('click', viewHome);
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
  }

  function authenticate() {
    // implement behavior for signing up
    let username = id('login-username').value;
    let password = id('login-password').value;
    fetch('/ecommerce/authentication?username=' + username + '&password=' + password)
      .then(statusCheck)
      .then(res => res.text())
      .then(res => console.log(res))
      .catch(handleError);
  }

  function fetchExploreRandomProducts() {
    // processExplore();
    fetch('/ecommerce/products')
      .then(statusCheck)
      .then(res => res.json())
      .then(processExplore)
      .catch(handleError);
  }

  /**
   * Process all the random products returned by the server
   * @param {object} response - the product server data for the random products
   */
  function processExplore(res) {
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

  function changeView(idOfVisibleView) {
    let allViews = qsa('#ecommerce-data > section');
    allViews.forEach(view => view.classList.add('hidden'));
    id(idOfVisibleView).classList.remove('hidden');
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