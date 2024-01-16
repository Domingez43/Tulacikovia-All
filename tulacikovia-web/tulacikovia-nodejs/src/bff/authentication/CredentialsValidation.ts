 import Joi from 'joi';

export class CredentialsValidation{

    validateEmail(email : string){
        const schema = Joi.string().email().required();
        return schema.validate(email);
    }

    validatePassword(password : string){
        const schema = Joi.string().min(8).required();
        return schema.validate(password);
    }

    validatePasswordMatch(password : string, repeatedPassword : string){
        const schema = Joi.object({
            password: Joi.string().required(),
            repeatedPassword: Joi.string()
                .valid(Joi.ref('password'))
                .required()
        });
        return schema.validate({ password, repeatedPassword });
    }

    validateCredentials(email : string, password : string, repeatedPassword : string){
        return !email || !password || !repeatedPassword;
    }
}
