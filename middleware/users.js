const fs = require('fs')

// create the data directory, if needed
if (!fs.existsSync('./data')) {
  fs.mkdir('./data', { recursive: true }, (err) => {
    if (err) throw err
  })
}

// get NODE_ENV from process.env
const { NODE_ENV } = process.env

// use test file if in test mode or use users file
const file = NODE_ENV === 'test' ? './data/test-data.json' : './data/users-data.json'

const getUsers = () => {
  try {
    const usersString = fs.readFileSync(file)
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

  const duplicateUsers = users.filter(currentUser => currentUser.email === user.email)

  if (duplicateUsers.length === 0) {
    users.push(user)
    saveUsers(users)
    return user
  }
}


const removeUser = id => {
  const users = getUsers()
  const filteredUsers = users.filter(currentUser => currentUser.id !== id)
  saveUsers(filteredUsers)

  return users.length !== filteredUsers.length
}

// get user
const getUserByEmail = email => {
  const users = getUsers()
  const filteredUsers = users.filter(currentUser => currentUser.email === email)
  return filteredUsers[0]
}

// get user by id
const getUserById = id => {
  const users = getUsers()
  const filteredUsers = users.filter(currentUser => currentUser.id === id)
  return filteredUsers[0]
}

module.exports = {
  removeAll,
  createUser,
  getUsers,
  getUserByEmail,
  getUserById,
  removeUser
}
