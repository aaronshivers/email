const request = require('supertest')
const expect = require('expect')
const { ObjectId } = require('mongodb')

const app = require('../app')
const User = require('../models/users')


describe('/users', () => {

  // users list
  const users = [{
    _id: new ObjectId(),
    email: 'user0@test.net',
    password: 'asdfASDF1234!@#$',
    isAdmin: true
  }, {
    _id: new ObjectId(),
    email: 'user1@test.net',
    password: 'asdfASDF1234!@#$',
    isAdmin: false
  }]

  // tokens array
  const tokens = []

  // run before each test
  beforeEach(async () => {

    // delete all users
    await User.deleteMany()

    // delete all tokens
    tokens.length = 0

    // save users
    const user0 = await new User(users[0]).save()
    const user1 = await new User(users[1]).save()

    // create token
    const token = user0.createAuthToken()

    // add token to tokens array
    tokens.push(token)

    // return users
    return users
  })

  // POST /users
  describe('POST /users', () => {
    
    it('should respond 400, and NOT create user, if email is invalid', async () => {

      const user = { email: 'asdf', password: 'asdfASDF1234!@#$' }

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
        .expect(res => {
          expect(res.header['set-cookie']).toBeFalsy()
        })
    })

    it('should respond 400, and NOT create user, if password is invalid', async () => {

      const user = { email: 'user2@test.net', password: 'pass' }

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
        .expect(res => {
          expect(res.header['set-cookie']).toBeFalsy()
        })
    })

    it('should respond 400, and NOT create user, if user already exists', async () => {
      
      const user = { email: 'user0@test.net', password: 'asdfASDF1234!@#$' }

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
        .expect(res => {
          expect(res.header['set-cookie']).toBeFalsy()
        })
    })
    
    it(`should respond 302, hash password, create a new user,
      token and cookie, then redirect to /users/me`, async () => {

      const user = { email: 'user2@test.net', password: 'asdfASDF1234!@#$' }

      await request(app)
        .post('/users')
        .send(user)
        .expect(302)
        .expect(res => {
          expect(res.header.location).toEqual('/users/me')
          expect(res.header['set-cookie']).toBeTruthy()
        })

      const foundUser = await User.findOne({ email: user.email })
      expect(foundUser).toBeTruthy()
      expect(foundUser.email).toEqual(user.email)
      expect(foundUser.password).not.toEqual(user.password)
    })
  })


})