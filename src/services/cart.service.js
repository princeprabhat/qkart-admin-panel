const httpStatus = require("http-status");
const { Cart, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");


// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const cart = await Cart.findOne({email:user.email})
  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart")
  }
  return cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  const product = await Product.findById(productId);
  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
  }
  
  const cart = await Cart.findOne({email:user.email});
  
  if(!cart){
    try {
      const newCart = await Cart.create({email:user.email,paymentOption:config.default_payment_option,cartItems:[{product,quantity}]});
     if(!newCart)
     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR)
      
      return newCart;
      
    } catch (error) {
    throw error;
      
    }
    
  }

  try {
  const itemExist = cart.cartItems.find(ele => ele.product._id==productId)
  if(itemExist)
    throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart");
  
  cart.cartItems.push({product,quantity});
  await cart.save()
  return cart;
  
  
} catch (error) {
  throw error
}

 
  
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const product = await Product.findById(productId);
  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
  }

  const cart = await Cart.findOne({email:user.email});
  if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a product");
  }
  const itemExist = cart.cartItems.find(ele => ele.product._id==productId);
  try {
    if(!itemExist){
      throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
    }

    cart.cartItems.forEach((el)=>{
      if(el.product._id==productId)
        el.quantity=quantity;
      
    })

    await cart.save()
    return cart;
    
  } catch (error) {
    throw error
  }


};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  try {
  const cart = await Cart.findOne({email:user.email});
  if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart");
  }

  const itemExist = cart.cartItems.find(ele => ele.product._id==productId);
  if(!itemExist){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
  }

  const updatedCart = cart.cartItems.filter((el)=>el.product._id != productId);
  cart.cartItems=updatedCart;

  await cart.save()
    
  } catch (error) {
    throw error
  }

};



// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  try {
     //should throw 404 error if cart is not present
  const cart = await Cart.findOne({email:user.email});

  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart")
  }


  //should throw 400 error if user's cart doesn't have any product
  if(cart.cartItems.length===0){
    throw new ApiError(httpStatus.BAD_REQUEST,"User's cart doesn't have any product");
  }

  const costTotal = cart.cartItems.reduce((ac,el)=>
   ( el.quantity*el.product.cost)+ac
  ,0)
  //should throw 400 error if address is not set - when User.hasSetNonDefaultAddress() returns false
const addressCheck = await user.hasSetNonDefaultAddress();
if(!addressCheck){
  throw new ApiError(httpStatus.BAD_REQUEST,"Address is not set");
}
  //should throw 400 error if wallet balance is insufficient

 
if(user.walletMoney<costTotal){
  throw new ApiError(httpStatus.BAD_REQUEST,"Wallet balance is insufficient")
}

  //should update user balance and empty the cart on success
user.walletMoney -= costTotal;

await user.save();

cart.cartItems = [];
await cart.save()
return cart;


  } catch (error) {
    throw error;
  }
 

  
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
