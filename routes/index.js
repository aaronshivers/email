const express = require('express')
const router = express.Router()
const sendErrorEmail = require('../emails/error')
const validate = require('../middleware/validate')
const messageValidator = require('../middleware/messageValidator')

const User = require('../models/users')

// GET /
router.get('/', (req, res) => res.send('howdy'))

// POST /
router.post('/', validate(messageValidator), (req, res) => {

  // get email address and message from body
  const { email, message, fields } = req.body

  // send message email
  if (process.env.NODE_ENV !== 'test') {
    sendErrorEmail(email, message, fields)
  }

  res.json({ email, message, fields })
})

// POST /all
router.post('/all', async (req, res) => {

  try {

    // find users
    const users = await User.find()

    // respond 400 if no users are found
    if (users.length === 0) return res.status(500).json({ notice: 'No Users Found'})

    // get email list from users
    const emailList = users.map(user => user.email)

    // if the server is not in test mode...
    if (process.env.NODE_ENV !== 'test') {

      // get message and field from the body
      const { message, field } = req.body

      // send email to each user
      emailList.forEach(email => sendErrorEmail(email, message, field))

      // respond with users list
      res.json({ notice: `Emails sent to the following users`, emailList })
    }

    res.json({ notice: `Server In Test Mode. No Emails Sent.`, emailList })

  } catch(error) {

    res.send(error.message)
  }
})

module.exports = router
