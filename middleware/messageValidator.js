const Joi = require('@hapi/joi')

const messageValidator = user => {
  const regex = /((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)).{8,100}/

  const schema = Joi.object().keys({
    email: Joi.string().min(5).max(100).email().required().error(() => {
      return `Email is required, and must contain 5-100 characters.`
    }),
    message: Joi.string().min(2).max(100).required().error(() => {
      return `Message is required, and must contain 2-100 characters.`
    }),
    fields: Joi.string().min(2).max(100).required().error(() => {
      return `Fields is required, and must contain 2-100 characters.`
    })
  })
  
  return Joi.validate(user, schema)
}

module.exports = messageValidator
