const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");


// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserById(id)
/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */

const getUserById = async (id) =>{
// try{
const userResult = await User.findOne({"_id": id});
return userResult;
// }
// catch(err){

//     throw new ApiError(httpStatus.BAD_REQUEST, "\"\"userId\"\" must be a valid mongo id")

// }
}


// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserByEmail(email)
/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */

const getUserByEmail = async (email) =>{
    try{
const userResult = await User.findOne({email:email})
return userResult
    }
    catch(err){
        throw new ApiError(httpStatus.BAD_REQUEST, "must be a valid email")
    }
}

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement createUser(user)
/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 * 
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */
const createUser = async(userBody)=>{
const {email} = userBody;

    const checkEmail = await User.isEmailTaken(email);
    if(checkEmail){
        throw new ApiError(httpStatus.OK, "Email already taken") 
    }
        // const salt = await bcrypt.genSalt();
        // const hashedPassword = await bcrypt.hash(password, salt);
        const result = await User.create({...userBody});
        // const result = await newUser.save();
        return result

}







 /*
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */



// TODO: CRIO_TASK_MODULE_CART - Implement getUserAddressById()
/**
 * Get subset of user's data by id
 * - Should fetch from Mongo only the email and address fields for the user apart from the id
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserAddressById = async (id) => {
    const address  = await User.findOne({_id:id},{address:1,email:1})
   return address;
};

/**
 * Set user's shipping address
 * @param {String} email
 * @returns {String}
 */
const setAddress = async (user, newAddress) => {
  user.address = newAddress;
  await user.save();

  return user.address;
};

module.exports = {
    getUserById,
    getUserByEmail,
    createUser,
    getUserAddressById,
    setAddress,
}
