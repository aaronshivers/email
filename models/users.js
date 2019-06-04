const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    maxlength: 100
  },
  isAdmin: {
    type: Boolean,
    required: false,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
})

// hash plain text passwords
userSchema.pre('save', async function(next) {
  const user = this
  const saltingRounds = 10

  if (user.isModified || user.isNew) {
    try {
      const hash = await bcrypt.hash(user.password, saltingRounds)
      user.password = hash
    } catch (error) {
      next(error)
    }
  }
  next()
})

// create authentication token
userSchema.methods.createAuthToken = async function () {
  const user = this
  const payload = { _id: user._id, isAdmin: user.isAdmin }
  const secret = process.env.JWT_SECRET
  const token = jwt.sign(payload, secret)

  user.tokens = user.tokens.concat({ token })
  await user.save()
  
  return token
}

const User = mongoose.model('User', userSchema)

module.exports = User
