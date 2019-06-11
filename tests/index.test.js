const request = require('supertest')
const expect = require('expect')

const app = require('../app')
const User = require('../models/users')

describe('/', () => {

  describe('GET /', () => {
    
    it('should respond 200', async () => {
    
      await request(app)
        .get('/')
        .expect(200)
    })
  })

  describe('POST /', () => {

    it('should recieve an email address error message, and container', async () => {

      const data = { email: 'test@example.com', message: 'test message', fields: 'container 1' }

      await request(app)
        .post('/')
        .send(data)
        .expect(200)
        .expect(res => {
          expect(res.body.email).toContain(data.email)
          expect(res.body.message).toContain(data.message)
          expect(res.body.fields).toContain(data.fields)
        })
    })
  })

  describe('POST /all', () => {

    it('should send an email to all users', async () => {

      const users = User.find()
      // console.log(users)
    })
  })
})