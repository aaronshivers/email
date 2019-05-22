const request = require('supertest')
const expect = require('expect')

const app = require('../app')
const users = require('../middleware/users')


describe('/users', () => {

  beforeEach(() => {

    const user = { email: 'hank.hill@stricklandlp.com', name: 'Hank Hill'}

    users.removeAll()
    users.createUser(user)
  })

  describe('POST /users', () => {

    it('should respond 400, if email is invalid', async () => {

      const user = { email: 'bad!email.com', name: 'Hank Hill'}

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
    })

    it('should respond 400, if name is invalid', async () => {

      const user = { email: 'hank.hill@stricklandlp.com', name: 1234}

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
    })

    it('should respond 400, if the user already exists', async () => {

      const user = { email: 'hank.hill@stricklandlp.com', name: 'Hank Hill'}

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
    })

    it('should respond 201, and create user', async () => {

      const user = { email: 'peggy.hill@tlhs.edu', name: 'Peggy Hill'}

      await request(app)
        .post('/users')
        .send(user)
        .expect(201)
        .expect(res => {
          expect(res.body.email).toContain(user.email)
          expect(res.body.name).toContain(user.name)
        })
    })
  })

  // describe('GET /users', () => {
    
  //   it('should respond 200', async () => {
    
  //     await request(app)
  //       .get('/users')
  //       .expect(200)
  //   })
  // })
})