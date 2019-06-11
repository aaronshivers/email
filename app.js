require('dotenv').config()

const express = require('express')
const mongoose = require('./db/mongoose')
const sendErrorEmail = require('./emails/error')
const User = require('./models/users')

const userRoutes = require('./routes/users')

const app = express()
const { PORT, HOST } = process.env

app.use(express.json())

app.use(userRoutes)

// GET /
app.get('/', (req, res) => res.send('howdy'))

// POST /
app.post('/', (req, res) => {

  // get email address and message from body
  const { email, message, fields } = req.body

  // send message email
  if (process.env.NODE_ENV !== 'test') {
    sendErrorEmail(email, message, fields)
  }

  res.send({ email, message, fields })
})

// POST /all
app.post('/all', async (req, res) => {

  try {

    // send message email
    if (process.env.NODE_ENV !== 'test') {

      // find users
      const users = await User.find()

      const emails = users.map(user => user.email)
  // console.log(emails)

      const { message, field } = req.body

      // send email to all users
      emails.forEach(email => sendErrorEmail(email, message, field))

      // respond with users list
      res.send(`Emails sent to the following users - ${ emails }`)
    }

    res.send(`Server In Test Mode. No Emails Sent.`)

  } catch(error) {

    res.send(error.message)
  }


})

app.listen(PORT, HOST)
console.log(`Running on http://${ HOST }:${ PORT }`)

module.exports = app
