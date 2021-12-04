"use strict";

(function() {
  window.addEventListener("load", init);

  function init() {
    fetchExploreRandomProducts();
    id("home-btn").addEventListener("click", homeView);
    id("account-btn").addEventListener("click", accountView);
    id("history-btn").addEventListener("click", historyView);
    id("cart-btn").addEventListener("click", cartView);
    id("search-btn").addEventListener("click", searchView);
  }

  function homeView() {
    id("cart-view").classList.add("hidden");
    id("search-view").classList.add("hidden");
    id("account-view").classList.add("hidden");
    id("history-view").classList.add("hidden");
    id("feedback-view").classList.add("hidden");
    id("home-view").classList.remove("hidden");
  }

  function accountView() {
    id("cart-view").classList.add("hidden");
    id("search-view").classList.add("hidden");
    id("account-view").classList.remove("hidden");
    id("history-view").classList.add("hidden");
    id("feedback-view").classList.add("hidden");
    id("home-view").classList.add("hidden");
  }

  function historyView() {
    id("cart-view").classList.add("hidden");
    id("search-view").classList.add("hidden");
    id("account-view").classList.add("hidden");
    id("history-view").classList.remove("hidden");
    id("feedback-view").classList.add("hidden");
    id("home-view").classList.add("hidden");
  }

  function cartView() {
    id("cart-view").classList.remove("hidden");
    id("search-view").classList.add("hidden");
    id("account-view").classList.add("hidden");
    id("history-view").classList.add("hidden");
    id("feedback-view").classList.add("hidden");
    id("home-view").classList.add("hidden");
  }

  function searchView() {
    id("cart-view").classList.add("hidden");
    id("search-view").classList.remove("hidden");
    id("account-view").classList.add("hidden");
    id("history-view").classList.add("hidden");
    id("feedback-view").classList.add("hidden");
    id("home-view").classList.add("hidden");
  }

  function fetchExploreRandomProducts() {
    processExplore();
    // fetch("/")
    //   .then(checkStatus)
    //   .then(resp => resp.json())
    //   .then(processExplore)
    //   .catch(handleError);
  }

  /**
   * Process all the random products returned by the server
   * @param {object} response - the product server data for the random products
   */
  function processExplore() {

    // placeholder for now
    for (let i = 0; i < 10; i++) {
      let productArticle = generateProductArticle(i);
      productArticle.classList.add("product-card");
      id("product-container").appendChild(productArticle);
    }


  }

  function generateProductArticle(num) {
    let article = gen("article");
    let text = gen("p");
    let img = gen("img");
    img.classList.add("product-img");
    img.src = "img/toaster.jpg";
    text.textContent = "Product " + num;
    article.appendChild(text);
    article.appendChild(img);
    return article;
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
})();