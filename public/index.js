"use strict";

(function() {
  window.addEventListener("load", init);

  function init() {
    console.log("HI");
    fetchExploreRandomProducts();

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
      id("home-view").appendChild(productArticle);
    }


  }

  function generateProductArticle(num) {
    let article = gen("article");
    let text = gen("p");
    text.textContent = "Product " + num;
    article.appendChild(text);
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