const express = require('express')
const router = express.Router()

const validate = require('../middleware/validate')
const userValidator = require('../middleware/userValidator')

const users = require('../middleware/users')

// POST /users
router.post('/users', validate(userValidator), (req, res) => {

  try {

    // get email and name from the body
    const { email, name } = req.body

    // check for existing user
    const existingUser = users.getUser(email)
    if (existingUser) return res.status(400).send(`User Already Exists`)

    // create and save user
    users.createUser({ email, name })

    // send welcome email
    if (process.env.NODE_ENV !== 'test') {
      sendWelcomeEmail(email, name)
    }

    // return email and name
    res.status(201).send({ email, name })

  } catch (error) {

    // send error message
    res.send(error.message)

  }
})

// GET /users
router.get('/users', (req, res) => {

  try {

    // get all users
    const userList = users.getUsers()

    // return user list
    res.send(userList)

  } catch (error) {

    // send error message
    res.send(error.message)
  }
})

// DELETE /users
router.delete('/users', (req, res) => {

  try {
    
    // get user email from body
    const { email, name } = req.body

    // verify that user is in the user list
    const foundUser = users.getUser(email)
    if (!foundUser) return res.send('User Not Found')

    // delete the user
    users.removeUser(email)

    // return deleted user
    res.send(foundUser)

  } catch (error) {
    throw new Error (error)
  }
})

module.exports = router
