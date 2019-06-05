const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')

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

// PATCH /users/:id
router.patch('/users/:id', [auth, validate(userValidator)], async (req, res) => {

  try {

    // verify isAdmin === true
    if (!req.user.isAdmin) return res.status(401).send('Access Denied! Admin Only!')

    // verify that the user exists in the DB
    const userToEdit = await User.findById(req.params.id)
    if (!userToEdit) return res.status(404).send('User Not Found')

    // get email and password
    const { email, password, name } = req.body

    // hash password
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)

    // check for duplicate user
    const duplicateUser = await User.findOne({ email })

    // reject if duplicate user
    if (duplicateUser) return res.status(400).send('Email Already In Use')

    // set updates and options
    const updates = { email, password: hash, name }
    const options = { new: true, runValidators: true }

    // update user
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, options)

    // respond 500 if user was not updated
    if (!updatedUser) return res.status(500).send('User Not Updated')

    // send updated user info
    res.send(updatedUser)

  } catch (error) {

    // send error message
    res.send(error.message)
  }
})

module.exports = router
