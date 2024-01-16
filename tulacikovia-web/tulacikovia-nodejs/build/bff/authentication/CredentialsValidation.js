"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsValidation = void 0;
const joi_1 = __importDefault(require("joi"));
class CredentialsValidation {
    validateEmail(email) {
        const schema = joi_1.default.string().email().required();
        return schema.validate(email);
    }
    validatePassword(password) {
        const schema = joi_1.default.string().min(8).required();
        return schema.validate(password);
    }
    validatePasswordMatch(password, repeatedPassword) {
        const schema = joi_1.default.object({
            password: joi_1.default.string().required(),
            repeatedPassword: joi_1.default.string()
                .valid(joi_1.default.ref('password'))
                .required()
        });
        return schema.validate({ password, repeatedPassword });
    }
    validateCredentials(email, password, repeatedPassword) {
        return !email || !password || !repeatedPassword;
    }
}
exports.CredentialsValidation = CredentialsValidation;
