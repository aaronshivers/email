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

    describe('when `email` is invalid', () => {

      it('should respond 400', async () => {

        const user = { email: 'asdf', password: 'asdfASDF1234!@#$' }

        await request(app)
          .post('/users')
          .send(user)
          .expect(400)
      })

      it('should NOT create user', async () => {

        const user = { email: 'asdf', password: 'asdfASDF1234!@#$' }

        await request(app)
          .post('/users')
          .send(user)

        const foundUsers = await User.find()
        expect(foundUsers.length).toBe(2)
      })
    })
    
    describe('when `password` is invalid', () => {

      const user = { email: 'user2@test.net', password: 'pass', token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }

      it('should respond 400', async () => {

        await request(app)
          .post('/users')
          .send(user)
          expect(400)
      })

      it('should NOT create user', async () => {

        await request(app)
          .post('/users')
          .send(user)

        const foundUsers = await User.find()
        expect(foundUsers.length).toBe(2)
      })
    })

    describe('when `user` already exists', () => {

      it('should respond 400', async () => {
        
        const user = userZero

        await request(app)
          .post('/users')
          .send(user)
      })

      it('should NOT create user', async () => {
        
        const user = userZero

        await request(app)
          .post('/users')
          .send(user)

        const foundUsers = await User.find()
        expect(foundUsers.length).toBe(2)
      })
    })

    describe('when data is valid', () => {

      const user = { email: 'user2@test.net', name: 'user 2', password: 'asdfASDF1234!@#$' }

      it(`should respond 200`, async () => {

        await request(app)
          .post('/users')
          .send(user)
          .expect(200)
      })

      it(`should hash the password`, async () => {

        await request(app)
          .post('/users')
          .send(user)
          .expect(res => {
            expect(res.body.user.password).not.toEqual(user.password)
          })

        const foundUser = await User.findOne({ email: user.email })
        expect(foundUser.password).not.toEqual(user.password)
      })

      it(`should create and return new user and token`, async () => {

        await request(app)
          .post('/users')
          .send(user)
          .expect(200)
          .expect(res => {
            expect(res.body.user.email).toEqual(user.email)
            expect(res.body.token).toBeTruthy()
          })

        const foundUser = await User.findOne({ email: user.email })
        expect(foundUser).toBeTruthy()
        expect(foundUser.email).toEqual(user.email)
      })
    })
  })

  // GET /users
  describe('GET /users', () => {

    describe('when no `token` is provided', () => {

      it('should respond 401', async () => {

        await request(app)
          .get(`/users`)
          .expect(401)
      })
    })

    describe('when a `token` is provided', () => {

      describe('and `user` is not an admin', () => {

        it('should respond 401', async () => {

          await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
            .expect(401)
        })
      })

      describe('and `user` is an admin', () => {

        it('should get all `users`', async () => {

          await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
            .expect(200)
            .expect((res) => {
              expect(res.text).toContain(userZero.email)
              expect(res.text).toContain(userOne.email)
            })
        })
      })
    })
  })

  // DELETE /users/:id
  describe('DELETE /users/:id', () => {

    describe('when `token` is not provided', () => {

      it('should respond 401', async () => {

        await request(app)
          .delete(`/users/${ userOneId }`)
          .expect(401)
      })
    })

    describe('when `token` is provided', () => {

      describe('and `user` is not an admin', () => {

        it('should respond 401', async () => {

          await request(app)
            .delete(`/users/${ userOneId }`)
            .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
            .expect(401)
        })
      })

      describe('and `user` is an admin', () => {

        describe('and `id` is invalid', () => {

          it('should return 400', async () => {

            request(app)
              .delete(`/users/1234`)
              .expect(400)
          })
        })
      })

      describe('and `id` is valid', () => {

        describe('and `user` is not found', () => {

          it('should return 404', async () => {

            request(app)
              .delete(`/users/${ new ObjectId() }`)
              .expect(404)
          })
        })

        describe('and `user` is found', () => {

          it('should respond 200', async () => {

            await request(app)
              .delete(`/users/${ userOneId }`)
              .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
              .expect(200)
          })

          it('should delete the user', async () => {

            await request(app)
              .delete(`/users/${ userOneId }`)
              .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)

            const users = await User.find()
            expect(users.length).toBe(1)
            expect(users.toString()).toContain(userZeroId)
          })
        })
      })
    })
  })

  // PATCH /users/:id
  describe('PATCH /users/:id', () => {

    describe('when `token` is not provided', () => {

      it('should respond 401', async () => {

        await request(app)
          .patch(`/users/${ userOneId }`)
          .expect(401)
      })
    })

    describe('when `token` is provided', () => {

      describe('and `user` is not an admin', () => {

        it('should respond 401', async () => {

          const update = {
            email: 'user@example.net',
            password: 'asdfASDF1234!@#$',
            name: 'updated user'
          }

          await request(app)
            .patch(`/users/${ userOneId }`)
            .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
            .send(update)
            .expect(401)
        })
      })

      describe('and `user` is an admin', () => {

        describe('and `ObjectId` is not in the DB', () => {

          it('should respond 404', async () => {

            const update = {
              email: 'user@example.net',
              password: 'asdfASDF1234!@#$',
              name: 'updated user'
            }

            await request(app)
              .patch(`/users/${ new ObjectId() }`)
              .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
              .send(update)
              .expect(404)
          })   
        })
      })

      describe('and `ObjectId` is in the DB', () => {

        describe('and `email` is invalid', () => {

            const update = {
              email: 12341234,
              password: 'asdfASDF1234!@#$',
              name: 'updated user'
            }

          it('should respond 400', async () => {

            await request(app)
              .patch(`/users/${ userOneId }`)
              .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
              .send(update)
              .expect(400)
          })

          it('should NOT update `user`', async () => {

            await request(app)
              .patch(`/users/${ userOneId }`)
              .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
              .send(update)

            const foundUser = await User.findById(userOneId)
            expect(foundUser._id).toEqual(userOneId)
            expect(foundUser.name).toEqual(userOne.name)
            expect(foundUser.email).not.toEqual(update.email)
          })
        })

        describe('and `password` is invalid', () => {

          const update = {
            email: 'user@example.net',
            password: 'asdf',
            name: 'updated user'
          }

          it('should respond 400', async () => {

            await request(app)
              .patch(`/users/${ userOneId }`)
              .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
              .send(update)
              .expect(400)
          })

          it('should NOT update a user with an invalid password', async () => {

            await request(app)
              .patch(`/users/${ userOneId }`)
              .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
              .send(update)

            const foundUser = await User.findById(userOneId)
            expect(foundUser._id).toEqual(userOneId)
            expect(foundUser.name).toEqual(userOne.name)
            expect(foundUser.email).not.toEqual(update.email)
          })
        })

        describe('and `name` is invaild', () => {

          const update = {
            email: 'user@example.net',
            password: 'asfdASDF1234!@#$',
            name: 'a'
          }

          it('should respond 400', async () => {

            await request(app)
              .patch(`/users/${ userOneId }`)
              .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
              .send(update)
              .expect(400)
          })

          it('should NOT update a user with an invalid name', async () => {
            
            await request(app)
              .patch(`/users/${ userOneId }`)
              .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
              .send(update)

            const foundUser = await User.findById(userOneId)
            expect(foundUser._id).toEqual(userOneId)
            expect(foundUser.name).toEqual(userOne.name)
            expect(foundUser.email).not.toEqual(update.email)
          })
        })
      })
    })





    it('should NOT update a user if the email is in use by another user', async () => {
      
      const update = userZero

      await request(app)
        .patch(`/users/${ userOneId }`)
        .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
        .send(update)
        .expect(400)

      const foundUser = await User.findById(userOneId)
      expect(foundUser._id).toEqual(userOneId)
      expect(foundUser.name).toEqual(userOne.name)
      expect(foundUser.email).not.toEqual(update.email)
    })

    it('should respond 302, save the updated user, and redirect to /users/profile if user is Admin', async () => {

      const update = {
        email: 'user@example.net',
        password: 'asdfASDF1234!@#$',
        name: 'updated user'
      }

      await request(app)
        .patch(`/users/${ userOneId }`)
        .set('Authorization', `Bearer ${ userZero.tokens[0].token }`)
        .send(update)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain(update.email)
          expect(res.text).toContain(update.name)
        })

        const foundUser = await User.findById(userOneId)
        expect(foundUser).toBeTruthy()
        expect(foundUser._id).toEqual(userOneId)
        expect(foundUser.email).toEqual(update.email)
        expect(foundUser.name).toEqual(update.name)
        expect(foundUser.password).not.toEqual(update.password)
    })
  })
})