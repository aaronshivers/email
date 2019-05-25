const express = require('express')
const router = express.Router()
const uuidv4 = require('uuid/v4')

const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')

const validate = require('../middleware/validate')
const userValidator = require('../middleware/userValidator')
const users = require('../middleware/users')

// POST /users
router.post('/users', validate(userValidator), async (req, res) => {

  try {

    // get email and password from the body
    const { email, password } = req.body

    // check db for existing user
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).render('error', { msg: 'User already registered.' })

    // create user
    const user = await new User({ email, password })

    // save user
    await user.save()

    // get auth token
    const token = await user.createAuthToken()

    // set cookie options
    const cookieOptions = { expires: new Date(Date.now() + 86400000), httpOnly: true  }

    // set header and return user info
    res.cookie('token', token, cookieOptions).redirect(`/users/me`)

  } catch (error) {

    // send error message
    res.render('error', { msg: error.message })

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

    // verify that user is in the user list
    const foundUser = users.getUserById(id)
    if (!foundUser) return res.send('User Not Found')

    // delete the user
    users.removeUser(id)

    // send goodby email
    if (process.env.NODE_ENV !== 'test') {
      sendGoodbyeEmail(foundUser.email, foundUser.name)
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
