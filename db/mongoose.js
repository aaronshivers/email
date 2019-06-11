const mongoose = require('mongoose')

const {
  MONGO_USER,
  MONGO_PASS,
  MONGO_CLUSTER,
  NODE_ENV
} = process.env

const uri = `mongodb+srv://${ MONGO_CLUSTER }.mongodb.net`
const encodedUri = encodeURI(uri)

options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  retryWrites: true,
  user: MONGO_USER,
  pass: MONGO_PASS,
  dbName: NODE_ENV
}

mongoose.connect(encodedUri, options)
  .then(() => console.log(`Connected to ${ NODE_ENV } Database`))
  .catch(err => console.log(err))

module.exports = mongoose
