const request = require('supertest')
const expect = require('expect')
const fs = require('fs')
const uuidv4 = require('uuid/v4')

const app = require('../app')
const users = require('../middleware/users')


describe('/users', () => {

  const usersList = [
    { id: uuidv4(), email: 'hank.hill@stricklandlp.com', name: 'Hank Hill'},
    { id: uuidv4(), email: 'peggy.hill@tlhs.edu', name: 'Peggy Hill'}
  ]

  beforeEach(() => {

    // create the data directory, if needed
    if (!fs.existsSync('./data')) {
      fs.mkdir('./data', { recursive: true }, (err) => {
        if (err) throw err
      })
    }

    users.removeAll()
    users.createUser(usersList[0])
    users.createUser(usersList[1])
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

      const user = usersList[0]

      await request(app)
        .post('/users')
        .send(user)
        .expect(400)
    })

    it('should respond 201, and create user', async () => {

      const user = { email: 'bobby.hill@tlhs.edu', name: 'Bobby Hill'}

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
          expect(res.body.length).toBe(2)
        })
    })
  })

  describe('DELETE /users', () => {

    it('should respond 200, and delete the specified user', async () => {

      const user = usersList[1]

      await request(app)
        .delete(`/users/${ user.id }`)
        .send(user)
        .expect(200)
        .expect(res => {
          expect(res.body.email).toContain(user.email)
          expect(res.body.name).toContain(user.name)
        })

      const allUsers = users.getUsers()
      expect(allUsers.length).toBe(1)
    })
  })

  describe('PUT /users', () => {

    it('should respond 400, if email is invalid', async () => {

      const user = { id: uuidv4(), email: 'bad!email.com', name: 'Hank Hill'}

      await request(app)
        .put(`/users/${ user.id }`)
        .send(user)
        .expect(400)
    })

    it('should respond 400, if name is invalid', async () => {

      const user = { id: uuidv4(), email: 'hank.hill@stricklandlp.com', name: 1234}

      await request(app)
        .put(`/users/${ user.id }`)
        .send(user)
        .expect(400)
    })

    it('should respond 400, if the updated user already exists', async () => {

      const user = usersList[0]

      await request(app)
        .put(`/users/${ user.id }`)
        .send(user)
        .expect(400)
    })

    it('should respond 400, if id is not in user list', async () => {

      const user = usersList[0]

      await request(app)
        .put(`/users/${ uuidv4() }`)
        .send(user)
        .expect(400)
    })

    it('should respond 200, and update user', async () => {

      const user = { email: 'bobby.hill@tlhs.edu', name: 'Bobby Hill'}

      await request(app)
        .put(`/users/${ usersList[0].id }`)
        .send(user)
        .expect(200)
        .expect(res => {
          expect(res.body.email).toContain(user.email)
          expect(res.body.name).toContain(user.name)
        })

      const allUsers = users.getUsers()
      expect(allUsers.length).toBe(2)
      expect(allUsers.toString()).toContain(user)
      expect(allUsers.toString()).not.toContain(usersList[0].email)
    })
  })
})