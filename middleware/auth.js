const jwt = require('jsonwebtoken')
const User = require('../models/users')

// auth middleware
module.exports = async (req, res, next) => {

  try {

    // get token from header
    const token = req.header('Authorization').replace('Bearer ', '')
    
    // get secret from env
    const secret = process.env.JWT_SECRET
    
    // verify token against the secret
    const decoded = await jwt.verify(token, secret)

    // find user by id and token
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    // reject if no user is found in the DB
    if (!user) throw new Error()

    // set req.user to hold the user data
    req.user = user

    // move to next middleware
    next()
    
  } catch (error) {
    
    // send error message
    res.status(401).send('Access Denied! Authentication Required.')
  }
}
