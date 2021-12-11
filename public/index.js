"use strict";

(function() {
  window.addEventListener("load", init);

  let USER;
  let PASS;

  function init() {
    fetchAllProducts();
    changeView('home-view');
    buttonBehavior();
  }

  function buttonBehavior() {
    let viewAccountBtn = id('account-btn');
    let ordersBtn = id('history-btn');
    let searchBtn = id('search-btn');
    let searchInput = id('search-term');
    let homeBtn = id('home-btn');
    let homeToggleBtn = id('change-home-view-btn');
    let searchToggleBtn = id('change-search-view-btn');
    let cartBtn = id('cart-btn');
    let submitAccountBtn = id('submit-account-btn');
    let signUpBtn = id('signup');
    let toggleSaveBtn = id('save-user-toggle');
    let historyBtn = id('history-btn');

    viewAccountBtn.addEventListener('click', viewAccount);
    ordersBtn.addEventListener('click', viewOrders);
    searchInput.addEventListener('input', checkSearchEnable);
    searchBtn.addEventListener('click', fetchSearch);
    submitAccountBtn.addEventListener('click', authenticate);
    signUpBtn.addEventListener('click', signup);
    toggleSaveBtn.addEventListener('click', toggleSaveUser);
    homeBtn.addEventListener('click', () => changeView('home-view'));
    homeToggleBtn.addEventListener('click', toggleProductView);
    searchToggleBtn.addEventListener('click', toggleProductView);
    cartBtn.addEventListener('click', viewCart);
    historyBtn.addEventListener('click', viewHistory);
  }

  function viewHistory() {
    changeView('history-view');

    fetch('/ecommerce/history?username=' + USER)
      .then(statusCheck)
      .then(res => res.json())
      .then(populateHistoryView)
      .catch(handleError);
  }

  function populateHistoryView(res) {
    res = res['history'];
    console.log(res);
    let cartId;
    let orderElement = gen('article');
    orderElement.classList.add('cart');
    res.forEach(item => {
      if (cartId !== item['cartId']) {
        id('history-view').appendChild(orderElement);
        orderElement = gen('article');
        orderElement.classList.add('cart');
        let cartIdElement = gen('p');
        cartIdElement.textContent = 'Cart ID: ' + item['cartId'];
        orderElement.appendChild(cartIdElement);
        cartId = item['cartId'];
      }
      let itemElement = gen('section');
      let itemNameElement = gen('p');
      let itemQuantityElement = gen('p');
      itemNameElement.textContent = 'Name: ' + item['name'];
      itemQuantityElement.textContent = 'Quantity: ' + item['quantity'];
      itemElement.appendChild(itemNameElement);
      itemElement.appendChild(itemQuantityElement);
      itemElement.classList.add('clothing-item');
      orderElement.appendChild(itemElement);
    });
    id('history-view').appendChild(orderElement);
  }

  function fetchSearch() {
    let searchTerm = id('search-term').value;
    fetch('/ecommerce/products?search=' + searchTerm)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(processSearch)
      .catch(handleError);
  }

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

  function toggleProductView() {
    let productArray = qsa('.product');
    for (let i = 0; i < productArray.length; i++) {
      productArray[i].classList.toggle('compact');
    }
  }

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
        password.value = ''
        id('login-view').classList.add('hidden');
        let createdAccountMsg = gen('p');
        qs('main').appendChild(createdAccountMsg);
        createdAccountMsg.textContent = res;
        setTimeout(() => {
          id('login-view').classList.remove('hidden');
          createdAccountMsg.remove()
        }, 1000)
      })
      .catch(handleError);
  }

  function viewCart() {
    if (!USER & !PASS) {
      changeView('cart-not-logged-view');
    } else {
      changeView('cart-view');
      let cartView = id('cart-view');
      cartView.innerHTML = '';
      let userCart = JSON.parse(window.localStorage.getItem(USER));
      if (userCart === null) {
        userCart = {}
      }
      let totalCost = 0;
      Object.keys(userCart).forEach(item => {

        let article = gen('article');
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
      priceElement.textContent = 'total cost: $' + totalCost;
      cartView.append(priceElement);
      cartView.appendChild(checkoutBtn);
    }

  }

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

  function viewAccount() {
    if (!USER & !PASS) {
      changeView('login-view');
      prefillUser();
    } else {
      changeView('login-success-view');
    }
  }
  function viewOrders() {
    if (!USER & !PASS) {
      changeView('history-not-logged-view');
    } else {
      changeView('history-view');
    }
  }

  function viewLoginSuccess() {
    changeView('login-success-view');
  }

  function prefillUser() {
    document.getElementById("login-username").value = window.localStorage.getItem('user');
    if ((window.localStorage.getItem('user')) !== null) {
      id('save-user-toggle').checked = true;
    }
  }

  function toggleSaveUser() {
    let user = window.localStorage.getItem('user');
    let toggleBtn = id('save-user-toggle');
    if (toggleBtn.checked) {
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
    res = res['products'];
    for (let i = 0; i < res.length; i++) {
      let productArticle = generateProductArticle(res[i]);
      id("home-view").appendChild(productArticle);
    }
  }

  function generateProductArticle(product) {
    let name = product['name'];
    let quantity = product['quantity'];
    let category = product['category'];
    let price = product['price'];

    let article = gen('article');
    let nameElement = gen('button');
    nameElement.classList.add('product-name-btn');
    nameElement.addEventListener('click', function() {
      changeView('product-view')
    });
    let quantityElement = gen('p');
    let categoryElement = gen('p');
    let priceElement = gen('p');
    let buyBtn = gen('button');

    nameElement.textContent = name;
    quantityElement.textContent = 'QT: ' + quantity;
    categoryElement.textContent = category;
    priceElement.textContent = '$' + price;
    buyBtn.textContent = 'Add to Cart!';

    // test this case later
    buyBtn.addEventListener('click', purchaseItem);
    if (quantity == 0) {
      buyBtn.disabled = true;
    }

    article.appendChild(nameElement);
    article.appendChild(quantityElement);
    article.appendChild(categoryElement);
    article.appendChild(priceElement);
    article.appendChild(buyBtn);
    article.classList.add('product');
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
      fetch('/ecommerce/purchase?productName=' + productName, {method: 'POST'})
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