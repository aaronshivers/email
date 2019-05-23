const express = require('express')
const router = express.Router()
const uuidv4 = require('uuid/v4')

const validate = require('../middleware/validate')
const userValidator = require('../middleware/userValidator')

const users = require('../middleware/users')

// POST /users
router.post('/users', validate(userValidator), (req, res) => {

  try {

    // get email and name from the body
    const { email, name } = req.body

    // check for existing user
    const existingUser = users.getUserByEmail(email)
    if (existingUser) return res.status(400).send(`User Already Exists`)

    // generate user id
    const id = uuidv4()

    // create and save user
    users.createUser({ id, email, name })

    // send welcome email
    if (process.env.NODE_ENV !== 'test') {
      sendWelcomeEmail(email, name)
    }

    // return email and name
    res.status(201).send({ id, email, name })

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
router.delete('/users/:id', (req, res) => {

  try {

    // get user id from params
    const { id } = req.params
    
    // get user email from body
    const { email, name } = req.body

    // verify that user is in the user list
    const foundUser = users.getUserById(id)
    if (!foundUser) return res.send('User Not Found')

    // delete the user
    users.removeUser(id)

    // send goodby email
    if (process.env.NODE_ENV !== 'test') {
      sendGoodbyeEmail(email, name)
    }

    // return deleted user
    res.send(foundUser)

  } catch (error) {
    
    // send error message
    res.send(error.message)
  }
})

// PUT /users
router.put('/users/:id', validate(userValidator), (req, res) => {
  
  try {

    // verify that req.params.id is in the users list
    const oldUser = users.getUserById(req.params.id)
    if (!oldUser) return res.status(400).send(`User Id Not Found`)

    // get email and name from the body
    const { email, name } = req.body

    // check for existing user
    const existingUser = users.getUserByEmail(email)
    if (existingUser) return res.status(400).send(`User Already Exists`)

    // delete old user
    const deletedUser = users.removeUser(req.params.id)
    if (!deletedUser) return res.status(500).send(`User Could Not Be Updated`)

    // generate new id
    const id = uuidv4()

    // create and save user
    const newUser = users.createUser({ id, email, name })

    // return email and name
    res.status(200).send(newUser)

  } catch (error) {

    // send error message
    res.send(error.message)

  }
})

module.exports = router
