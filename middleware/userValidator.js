const Joi = require('@hapi/joi')

const userValidator = user => {

  const schema = Joi.object().keys({
    email: Joi.string().min(5).max(100).email().required().error(() => {
      return `Email is required, and must contain 5-100 characters.`
    }),
    name: Joi.string().min(2).max(100).required().error(() => {
      return `Name is required, and must contain 2-100 characters.`
    })
  })
  
  return Joi.validate(user, schema)
}

module.exports = userValidator
