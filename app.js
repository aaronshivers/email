require('dotenv').config()

const express = require('express')

const app = express()
const { PORT } = process.env || 3000

app.get('/', (req, res) => res.send('howdy'))

app.listen(PORT, () => console.log(`Server listening on port ${ PORT }.`))

module.exports = app
