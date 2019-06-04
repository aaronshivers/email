const express = require('express')
const router = express.Router()

const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')

const User = require('../models/users')
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')
const userValidator = require('../middleware/userValidator')

// POST /users
router.post('/users', validate(userValidator), async (req, res) => {

  try {

    // get email and password from the body
    const { email, name, password } = req.body

    // check db for existing user
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).send('User already registered.')

    // create user
    const user = await new User({ email, name, password })

    // save user
    await user.save()

    // get auth token
    const token = await user.createAuthToken()

    // set return user info
    res.send({ user, token })

  } catch (error) {

    // send error message
    res.send(error.message)

  }
})

// GET /users
router.get('/users', auth, async (req, res) => {

  try {

    // verify isAdmin === true
    if (!req.user.isAdmin) return res.status(401).send('Access Denied! Admin Only!')

    // find users
    const users = await User.find()

    // create usersList
    const usersList = []

    // add users to userList
    for (const user of users) {
      usersList.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      })
    }

    // return users
    res.send(usersList)

  } catch (error) {

    // send error message
    res.send(error.message)
  }
})

// DELETE /users
router.delete('/users/:id', auth, async (req, res) => {

  try {

    // verify isAdmin === true
    if (!req.user.isAdmin) return res.status(401).send('Access Denied! Admin Only!')

    // find and delete the user
    const deletedUser = await User.findByIdAndDelete(req.params.id)

    // reject if user was not found
    if (!deletedUser) return res.status(404).render('User Not Found')

    // send goodby email
    if (process.env.NODE_ENV !== 'test') {
      sendGoodbyeEmail(deletedUser.email, deletedUser.name)
    }

    // return deleted user
    res.send(deletedUser)

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
