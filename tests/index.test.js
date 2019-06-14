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

    describe('when no data is sent', () => {

      it('should respond 400', async () => {

        await request(app)
          .post('/all')
          .expect(400)
      })
    })

    describe('when data is sent', () => {

      describe('and the data is invalid', () => {

        it('should respond 400', async () => {

          await request(app)
            .post('/all')
            .expect(400)
        })
      })
    
      describe('and the data is valid', () => {

        it('should respond 200', async () => {

          await request(app)
            .post('/all')
            .expect(200)
        })

        it('should return a list of all users', async () => {

          const users = User.find()

          await request(app)
            .post('all')
            .expect(res => {
              expect(res.body).toBe(users)
            })
        })
      })
    })
  })
})