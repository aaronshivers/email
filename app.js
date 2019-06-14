require('dotenv').config()

const express = require('express')
const mongoose = require('./db/mongoose')

const indexRoutes = require('./routes/index')
const userRoutes = require('./routes/users')

const app = express()
const { PORT, HOST } = process.env

app.use(express.json())

app.use(indexRoutes)
app.use(userRoutes)

app.listen(PORT, HOST)
console.log(`Running on http://${ HOST }:${ PORT }`)

module.exports = app
