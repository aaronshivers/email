const postmark = require("postmark")

const serverToken = process.env.POSTMARK_TOKEN

// Send an email:
const client = new postmark.ServerClient(serverToken)

const sendWelcomeEmail = (email, name) => {
  client.sendEmail({
    "To": email,
    "From": 'aaron@aaronshivers.com',
    "Subject": 'Welcome to Meep',
    "TextBody": `Welcome to Meep, ${ name }. I hope that you enjoy it.`
  })
}

const sendGoodbyeEmail = (email, name) => {
  client.sendEmail({
    "To": email,
    "From": 'aaron@aaronshivers.com',
    "Subject": 'Sorry, to see you go.',
    "TextBody": `Goodbye, ${ name }. I hope to see you again.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail
}
