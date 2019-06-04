const request = require('supertest')
const expect = require('expect')
const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const app = require('../app')
const User = require('../models/users')


describe('/users', () => {

  // create object id's for users
  const userZeroId = new ObjectId()
  const userOneId = new ObjectId()

  // user zero
  const userZero = {
    _id: userZeroId,
    name: 'user 0',
    email: 'user0@test.net',
    password: 'asdfASDF1234!@#$',
    isAdmin: true,
    tokens: [{
      token: jwt.sign({ _id: userZeroId }, process.env.JWT_SECRET)
    }]
  }

  // user one
  const userOne = {
    _id: userOneId,
    name: 'user 1',
    email: 'user1@test.net',
    password: 'asdfASDF1234!@#$',
    isAdmin: false,
    tokens: [{
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
  }

  // run before each test
  beforeEach(async () => {

    // delete all users
    await User.deleteMany()

    // save users
    await new User(userZero).save()
    await new User(userOne).save()
  })

  // POST /users
  describe('POST /users', () => {
    
    it('should respond 400, and NOT create user, if email is invalid', async () => {

      const user = { email: 'asdf', password: 'asdfASDF1234!@#$' }

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
    })

    it('should respond 400, and NOT create user, if password is invalid', async () => {

      const user = { email: 'user2@test.net', password: 'pass', token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
    })

    it('should respond 400, and NOT create user, if user already exists', async () => {
      
      const user = userZero

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
    })
    
    it(`should respond 200, hash password, create and return new user and token`, async () => {

      const user = { email: 'user2@test.net', name: 'user 2', password: 'asdfASDF1234!@#$' }

      await request(app)
        .post('/users')
        .send(user)
        .expect(200)
        .expect(res => {
          expect(res.body.user.email).toEqual(user.email)
          expect(res.body.user.password).not.toEqual(user.password)
          expect(res.body.token).toBeTruthy()
        })

      const foundUser = await User.findOne({ email: user.email })
      expect(foundUser).toBeTruthy()
      expect(foundUser.email).toEqual(user.email)
      expect(foundUser.password).not.toEqual(user.password)
    })
  })

  // GET /users
  describe('GET /users', () => {

    it('should respond 401 if user is NOT admin', async () => {

      await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .expect(401)
    })
  })
})