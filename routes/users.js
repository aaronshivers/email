const express = require('express')
const router = express.Router()

const validate = require('../middleware/validate')
const userValidator = require('../middleware/userValidator')

const users = require('../middleware/users')

router.post('/users', validate(userValidator), (req, res) => {

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
})

module.exports = router
