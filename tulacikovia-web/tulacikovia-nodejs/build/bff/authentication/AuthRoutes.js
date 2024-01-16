"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Authenticator } = require('./AuthService');
const class_transformer_1 = require("class-transformer");
const CredentialsValidation_1 = require("./CredentialsValidation");
const EmailService_1 = require("./EmailService");
const externalAccountAuthorizedUserClient_1 = require("google-auth-library/build/src/auth/externalAccountAuthorizedUserClient");
module.exports = router;
router.post('/register', async (req, res) => {
    try {
        const { email, password, repeatedPassword } = req.body;
        const credentialsValidator = new CredentialsValidation_1.CredentialsValidation();
        if (credentialsValidator.validateCredentials(email, password, repeatedPassword)) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        //verifying if user exists already
        const authenticator = new Authenticator();
        var userExistence = await authenticator.doesUserExists(email);
        if (userExistence) {
            return res.status(200).json({ message: 'User already exists' });
        }
        //verifying email, and password
        if (credentialsValidator.validateEmail(email).error) {
            return res.status(200).json({ message: 'Email is invalid' });
        }
        if (credentialsValidator.validatePasswordMatch(password, repeatedPassword).error) {
            return res.status(200).json({ message: 'Passwords are not identical' });
        }
        if (credentialsValidator.validatePassword(password).error) {
            return res.status(200).json({ message: 'Password is too short' });
        }
        //Adding user
        const hashedpswd = await authenticator.hashPassword(password);
        var userAddResult = await authenticator.registerNewUser(email, hashedpswd);
        if (userAddResult) {
            return res.status(201).json({ message: 'Registration successful' });
        }
        else {
            return res.status(400).json({ message: 'Registration unsuccessful' });
        }
    }
    catch (ex) {
        res.status(500).send(JSON.stringify(ex.message));
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const authenticator = new Authenticator();
        var isVerified = await authenticator.verifyUser(email, password);
        if (isVerified) {
            res.status(200).json({ message: " Login successful." });
        }
        else {
            res.status(200).json({ message: " Login unsuccessful." });
        }
    }
    catch (ex) {
        res.status(500).send(JSON.stringify(ex.message));
    }
});
router.post('/isEmailAvailable', async (req, res) => {
    const { email } = req.body;
    console.log('called: ' + email);
    try {
        const authenticator = new Authenticator();
        var isEmailAvailable = await authenticator.doesUserExists(email);
        if (isEmailAvailable) {
            res.status(200).json({ message: "User already exists." });
        }
        else {
            res.status(200).json({ message: "Email is available." });
        }
    }
    catch (error) {
        res.status(400).json({ error: error });
    }
});
router.post('/sendResetMail', async (req, res) => {
    const { email } = req.body;
    try {
        const authenticator = new Authenticator();
        const emailService = new EmailService_1.EmailService();
        const emailExistence = await authenticator.doesUserExists(email);
        if (!emailExistence) {
            return res.status(200).json({ message: 'User does not exists.' });
        }
        await authenticator.generateResetToken(email);
        console.log("email", email);
        const token = await authenticator.getUserResetToken(email);
        const result = await emailService.sendMail(email, token);
        res.status(200).json({ message: "Email sent." });
    }
    catch (error) {
        console.error("Change password error:", error);
    }
});
router.get('/passwordReset/:token', (req, res) => {
    const { token } = req.params;
    //IDK CI TOTO TREBA
});
//TODO: CHCECK IF OLD PASSWORD ISNT SAME AS NEW
router.post('/passwordReset/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword, newPasswordRepated } = req.body;
    const authenticator = new Authenticator();
    const credentialsValidator = new CredentialsValidation_1.CredentialsValidation();
    if (credentialsValidator.validatePasswordMatch(newPassword, newPasswordRepated).error) {
        return res.status(200).json({ message: 'Passwords are not identical' });
    }
    if (credentialsValidator.validatePassword(newPassword).error) {
        return res.status(200).json({ message: 'Password is too short' });
    }
    const tokenValidation = await authenticator.tokenValidator(token);
    if (!tokenValidation) {
        return res.status(200).json({ message: 'Token is invalid.' });
    }
    try {
        await authenticator.changePassword(token, newPassword);
        res.status(200).json({ message: 'Password reset successful' });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(400).json({ message: 'Internal server error' });
    }
});
//TODO: DELETE ALL USER ACCTIONS
router.delete('/deleteAccount', async (req, res) => {
    const { email } = req.body;
    try {
        const authenticator = new Authenticator();
        var isDeleted = await authenticator.deleteUser(email);
        if (isDeleted) {
            res.status(200).json({ message: "Account deleted.",
                userMail: email });
        }
        else {
            res.status(400).json({ message: "Account wasnt deleted." });
        }
    }
    catch (ex) {
        res.status(400).send(JSON.stringify(ex.message));
    }
});
router.get("/google", async (req, res) => {
    try {
        const { code, state } = req.query;
        const authenticator = new Authenticator();
        var appRedirect = state.split(';')[1].split('@')[1];
        var status = state.split(';')[0].split('@')[1];
        if (!code)
            return res.status(400).json({ error: "invalid code" });
        var authResult = await authenticator.googleSignUp(code, appRedirect);
        res.status(200).send(authResult.redirect);
    }
    catch (ex) {
        res.status(400).json({ error: ex.message });
    }
});
router.get("/facebook", async (req, res) => {
    try {
        const { code, state } = req.query;
        const authenticator = new Authenticator();
        var appRedirect = state.split(';')[1].split('@')[1];
        var status = state.split(';')[0].split('@')[1];
        if (!code)
            return res.status(400).json({ error: "invalid code" });
        var authResult = await authenticator.facebookSignUp(code, appRedirect);
        res.status(200).send(authResult.redirect);
    }
    catch (ex) {
        res.status(400).json({ error: ex.message });
    }
});
router.get("/testUser", Authenticator.UserAuth, async (req, res) => {
    try {
        res.status(200).json(req.subject);
    }
    catch (ex) {
        res.status(400).json({ error: ex.message });
    }
});
