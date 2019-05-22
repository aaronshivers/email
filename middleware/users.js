const fs = require('fs')

// get NODE_ENV from process.env
const { NODE_ENV } = process.env

// use test file if in test mode or use users file
const file = NODE_ENV === 'test' ? './data/test-data.json' : './data/users-data.json'

const getUsers = () => {
  try {
    const usersString = fs.readFileSync(file)
  // console.log(JSON.parse(usersString))
    return JSON.parse(usersString)
  } catch (e) {
    return []
  }
}

const saveUsers = users => {
  fs.writeFileSync(file, JSON.stringify(users))
}

const removeAll = () => saveUsers([])

const createUser = user => {
  const users = getUsers()

  const duplicateUsers = users.filter(currentUser => {
    return currentUser.email === user.email
  })

  if (duplicateUsers.length === 0) {
    users.push(user)
    saveUsers(users)
    return user
  }
}


const removeUser = email => {
  const users = getUsers()
  const filteredUsers = users.filter(currentUser => currentUser.email !== email)
  saveUsers(filteredUsers)

  return users.length !== filteredUsers.length
}

// get user by email
const getUser = email => {
  const users = getUsers()
  const filteredUsers = users.filter(currentUser => currentUser.email === email)
  return filteredUsers[0]
}

// const logUser = user => {
//   console.log('')
//   console.log(`User: ${ user }`)
// }

module.exports = {
  removeAll,
  createUser,
  getUsers,
  getUser,
  removeUser
  // logUser
}
