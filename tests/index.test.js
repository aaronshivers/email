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

    describe('when no data is sent', () => {

      it('should respond 400', async () => {

        await request(app)
          .post('/')
          .expect(400)
      })
    })

    describe('when data is sent', () => {

      describe('and the email is invalid', () => {

        const data = { email: 1234, message: 'test message', fields: 'container 1' }

        it('should respond 400', async () => {

          await request(app)
            .post('/')
            .send(data)
            .expect(400)
        })
      })
    
      describe('and the message is invalid', () => {

        const data = { email: 'test@example.com', message: 1234, fields: 'container 1' }

        it('should respond 400', async () => {

          await request(app)
            .post('/')
            .send(data)
            .expect(400)
        })
      })
    
      describe('and fields is invalid', () => {

        const data = { email: 'test@example.com', message: 'test message', fields: 1234 }

        it('should respond 400', async () => {

          await request(app)
            .post('/')
            .send(data)
            .expect(400)
        })
      })
    
      describe('and the data is valid', () => {

        const data = { email: 'test@example.com', message: 'test message', fields: 'container 1' }

        it('should respond 200', async () => {
  
          await request(app)
            .post('/')
            .send(data)
            .expect(200)
        })

        it('should return the data', async () => {

          await request(app)
            .post('/')
            .send(data)
            .expect(res => {
              expect(res.body).toEqual(data)
            })
        })
      })
    })
  })

  describe('POST /all', () => {

    beforeEach(async () => {

      await User.deleteMany()

      const user = {
        name: 'Bob',
        email: 'bob@test.net',
        password: 'asdfASDF1234!@#$'
      }

      await new User(user).save()
    })

    describe('when no users are found', () => {

      it('should respond 500', async () => {

        await User.deleteMany()

        await request(app)
          .post('/all')
          .expect(500)
      })
    })

    describe('when users are found', () => {

      describe('and the server is in test mode', () => {

        it('should respond 200', async () => {

          await request(app)
            .post('/all')
            .expect(200)
        })

        it('should return a list of user email addresses', async () => {

          const users = await User.find()
          const emailList = users.map(user => user.email)

          await request(app)
            .post('/all')
            .expect(res => {
              expect(res.text).toContain(JSON.stringify(emailList))
            })
        })
      })
    
      describe('and the server is not in test mode', () => {

        it('should respond 200', async () => {

          await request(app)
            .post('/all')
            .expect(200)
        })

        it('should send an email to all users', () => {})

        it('should return a list of user email addresses', async () => {

          const users = await User.find()
          const emailList = users.map(user => user.email)

          await request(app)
            .post('/all')
            .expect(res => {
              expect(res.text).toContain(JSON.stringify(emailList))
            })
        })
      })
    })
  })
})