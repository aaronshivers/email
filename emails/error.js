const postmark = require('postmark')

const serverToken = process.env.POSTMARK_TOKEN

// Send an email:
const client = new postmark.ServerClient(serverToken)

const sendErrorEmail = (email, message, field) => {
  client.sendEmail({
    "To": email,
    "From": 'aaron@aaronshivers.com',
    "Subject": 'Error',
    "TextBody": `Error: ${ message }, ${ field }`
  })
}

module.exports = sendErrorEmail
