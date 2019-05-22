const request = require('supertest')
const expect = require('expect')
const fs = require('fs')

const app = require('../app')
const users = require('../middleware/users')


describe('/users', () => {

  beforeEach(() => {

    const user = { email: 'hank.hill@stricklandlp.com', name: 'Hank Hill'}

    // create the data directory, if needed
    if (!fs.existsSync('./data')) {
      fs.mkdir('./data', { recursive: true }, (err) => {
        if (err) throw err
      })
    }

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

  describe('GET /users', () => {
    
    it('should respond 200, and return user list', async () => {
    
      await request(app)
        .get('/users')
        .expect(200)
        .expect(res => {
          expect(res.body.length).toBe(1)
        })
    })
  })
})