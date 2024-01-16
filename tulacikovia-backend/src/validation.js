// validation.js

const Joi = require('joi');

const validateEmail = (email) => {
    const schema = Joi.string().email().required();
    return schema.validate(email);
};

const validatePassword = (password) => {
    const schema = Joi.string().min(8).required();
    return schema.validate(password);
};

const validatePasswordMatch = (password, repeatedPassword) => {
    const schema = Joi.object({
        password: Joi.string().required(),
        repeatedPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
    });
    return schema.validate({ password, repeatedPassword });
};

module.exports = {
    validateEmail,
    validatePassword,
    validatePasswordMatch,
};
