require('dotenv').config()

const express = require('express')
const sendErrorEmail = require('./emails/error')

const app = express()
const { PORT } = process.env || 3000

app.use(express.json())

// GET /
app.get('/', (req, res) => res.send('howdy'))

// POST /
app.post('/', (req, res) => {

  // get email address and message from body
  const { email, message } = req.body

  // send message email
  if (process.env.NODE_ENV !== 'test') {
    sendErrorEmail(email, message)
  }

  res.send({ email, message })
})

app.listen(PORT, () => console.log(`Server listening on port ${ PORT }.`))

module.exports = app
