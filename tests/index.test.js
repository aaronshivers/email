const request = require('supertest')
const expect = require('expect')

const app = require('../app')

describe('/', () => {

  describe('GET /', () => {
    
    it('should respond 200', async () => {
    
      await request(app)
        .get('/')
        .expect(200)
    })
  })

  describe('POST /', () => {

    it('should recieve an email address and error message', async () => {

      const data = { email: 'test@example.com', message: 'test message'}

      await request(app)
        .post('/')
        .send(data)
        .expect(200)
        .expect(res => {
          expect(res.body.email).toContain(data.email)
          expect(res.body.message).toContain(data.message)
        })
    })
  })
})