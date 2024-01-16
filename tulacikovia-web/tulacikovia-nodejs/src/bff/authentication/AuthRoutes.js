const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { Authenticator } = require('./AuthService');
const { TransformationType } = require('class-transformer');
const { CredentialsValidation } = require('./CredentialsValidation');
const { EmailService } = require('./EmailService');
const { EXTERNAL_ACCOUNT_AUTHORIZED_USER_TYPE } = require('google-auth-library/build/src/auth/externalAccountAuthorizedUserClient');
const { EmailAuthProfile, OrganizationProfile, authProfileData, UserProfile  } = require('../models/UserModel');
const { CLIENT_SECRET } = require('./AuthService');
/*import { TransformationType } from 'class-transformer';
import { CredentialsValidation } from './CredentialsValidation';
import { EmailService } from './EmailService';
import { EXTERNAL_ACCOUNT_AUTHORIZED_USER_TYPE } from 'google-auth-library/build/src/auth/externalAccountAuthorizedUserClient';
import { EmailAuthProfile, OrganizationProfile, authProfileData, UserProfile } from '../models/UserModel';
import { CLIENT_SECRET } from './AuthService';*/
 
module.exports = router

router.post('/register', async (req, res) => {
    try {
        const {email, password, repeatedPassword} = req.body;

        const credentialsValidator = new CredentialsValidation();
        
        
        
        if(credentialsValidator.validateCredentials(email, password, repeatedPassword)){
            return res.status(400).json({message: 'Please provide all required fields'});
        }

        //verifying if user exists already
        const authenticator = new Authenticator();
        var userExistence = await authenticator.doesUserExists(email);

        if(userExistence){
            return res.status(400).json({message: 'User already exists'})
        }
 
        //verifying email, and password
        if(credentialsValidator.validateEmail(email).error){
            return res.status(400).json({message: 'Email is invalid'});
        }

        if (credentialsValidator.validatePasswordMatch(password, repeatedPassword).error) {
            return res.status(400).json({message: 'Passwords are not identical' });
        }

        if(credentialsValidator.validatePassword(password).error){
            return res.status(400).json({message: 'Password is too short'});
        }

        //Adding user
        const hashedpswd = await authenticator.hashPassword(password);
        var _ = await authenticator.registerNewUser(email, hashedpswd);
        var authData = new EmailAuthProfile(email, hashedpswd);

        const token = jwt.sign({userProfile: authData, authProfile: undefined}, CLIENT_SECRET, { expiresIn: '6h' });

        res.status(200).json({status: "REGISTERED", token: token});

    } catch (ex) {
        res.status(500).send(JSON.stringify(ex.message));
    }

});

router.post('/login', async (req, res) => {

    const {email, password} = req.body;

    try {
        const authenticator = new Authenticator();
        var isVerified = await authenticator.verifyUser(email, password);
        var userProfile = await UserProfile.initFromDB(undefined, email);

        if(!userProfile) throw new Error('Unable to recieve user profile for email: ' + email);
        const token = jwt.sign({userProfile: userProfile, authProfile: undefined}, CLIENT_SECRET, { expiresIn: '6h' });
        
        if(isVerified){
            res.status(200).json({status: "LOGGEDIN", token: token});
        } else {
            res.status(200).json({status: "ERROR"});
        }
        
    } catch (ex) {
        res.status(500).send(JSON.stringify(ex.message));
    }
});

router.post('/registration/user/email/finish', Authenticator.UserAuth, async (req, res) => {
    try {
        const {name} = req.body;

        var auth = new Authenticator();
        var temporaryProfile = req.subject.userProfile;
        var userId = await auth.getUserID(temporaryProfile.email);

        if(!userId) throw new Error('Cannot register because user credentials for this user does not exists');

        const user = await UserProfile.createUserProfile(temporaryProfile, userId, false);
        user.name = name;
        const token = await auth.finishRegistration(user, temporaryProfile);

        res.status(200).send({ status: "AUTHENTICATED", token: token });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
})

router.post('/registration/organisation/email/finish', Authenticator.UserAuth, async (req, res) => {
    try {
        const {formal_name, formal_type, identification_number, bank_contact, profile_name} = req.body;

        var auth = new Authenticator();
        var socialData = req.subject.userProfile;
        var userId = await auth.getUserID(socialData.email);

        if(!userId) throw new Error('Cannot register because user credentials for this user does not exists');

        const user = await OrganizationProfile.createOrganisationProfile(socialData, userId, false);
        user.formalName = formal_name;
        user.formalType = formal_type;
        user.identificationNumber = identification_number;
        user.bankContact = bank_contact;
        user.name = profile_name;
        const token = await auth.finishRegistration(user, socialData);

        res.status(200).send({ status: "AUTHENTICATED", token: token });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
})

router.post('/registration/user/social/finish', Authenticator.UserAuth, async (req, res) => {
    try {
        var auth = new Authenticator();
        var socialData = req.subject.userProfile;
        var userId = await auth.getUserID(socialData.email);

        if(!userId) throw new Error('Cannot register because user credentials for this user does not exists');

        const user = await UserProfile.createUserProfile(socialData, userId, false);
        const token = await auth.finishRegistration(user, socialData);

        res.status(200).send({ status: "AUTHENTICATED", token: token });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
})

router.post('/registration/organisation/social/finish', Authenticator.UserAuth, async (req, res) => {
    try {
        const {formal_name, formal_type, identification_number, bank_contact} = req.body;

        var auth = new Authenticator();
        var socialData = req.subject.userProfile;
        var userId = await auth.getUserID(socialData.email);
        if(!userId) throw new Error('Cannot register because user credentials for this user does not exists');

        const user = await OrganizationProfile.createOrganisationProfile(socialData, userId, false);
        user.formalName = formal_name;
        user.formalType = formal_type;
        user.identificationNumber = identification_number;
        user.bankContact = bank_contact;
        const token = await auth.finishRegistration(user, socialData);

        res.status(200).send({ status: "AUTHENTICATED", token: token });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
}) 


router.post('/isEmailAvailable', async(req,res)=>{
    const {email} = req.body;
    console.log('called: ' + email);
    try{
        const authenticator = new Authenticator();
        var isEmailAvailable = await authenticator.doesUserExists(email);
        if(isEmailAvailable){
            res.status(200).json({message:"User already exists."});
        }else{
            res.status(200).json({message:"Email is available."});
        }
    }catch(error){
        res.status(400).json({error: error});
    }
});


router.post('/sendResetMail', async(req,res,) =>{
    const {email} = req.body;
    try{
        const authenticator = new Authenticator();
        const emailService = new EmailService();
        
        const emailExistence = await authenticator.doesUserExists(email);
        if(!emailExistence){
            return res.status(200).json({message: 'User does not exists.'})
        }

        await authenticator.generateResetToken(email);
        console.log("email",email);

        const token = await authenticator.getUserResetToken(email);
        const result = await emailService.sendMail(email,token);
        res.status(200).json({message: "Email sent."});
    }catch(error){
        console.error("Change password error:",error);
    }
})


router.get('/passwordReset/:token', (req, res) => {
    const { token } = req.params;
    //IDK CI TOTO TREBA
});


//TODO: CHCECK IF OLD PASSWORD ISNT SAME AS NEW
router.post('/passwordReset/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword,newPasswordRepated} = req.body;
    
    const authenticator = new Authenticator();

    const credentialsValidator = new CredentialsValidation();

    if (credentialsValidator.validatePasswordMatch(newPassword, newPasswordRepated).error) {
        return res.status(200).json({message: 'Passwords are not identical' });
    }

    if(credentialsValidator.validatePassword(newPassword).error){
        return res.status(200).json({message: 'New password is too short'});
    }

    const tokenValidation = await authenticator.tokenValidator(token);
    if(!tokenValidation){
        return res.status(200).json({message: 'Token is invalid.'});
    }

    try {
        await authenticator.changePassword(token,newPassword);
        
        res.status(200).json({ message: 'Password reset successful' });
    }catch (error) {
        console.error('Error resetting password:', error);
        res.status(400).json({ message: 'Internal server error' });
    }
  });


//TODO: DELETE ALL USER ACCTIONS
router.delete('/deleteAccount', Authenticator.UserAuth, async(req,res)=>{
    // const {email} = req.body;
   
    try{
        const authenticator = new Authenticator();
        var isDeleted = await authenticator.deleteUser(req.subject.userProfile.email);
        if(isDeleted){
            res.status(200).json({message:"Account deleted.",
                                userMail: req.subject.userProfile.email});
        }else{
            res.status(400).json({message:"Account wasnt deleted."});
        }
    } catch(ex){
        res.status(400).send(JSON.stringify(ex.message));
    }
});


router.get("/google", async (req, res) => {

    try {
        const { code, state } = req.query;
        const authenticator = new Authenticator();
        
        var appRedirect = state.split(';')[1].split('@')[1];
        var status = state.split(';')[0].split('@')[1];

        if (!code) return res.status(400).json({  error: "invalid code" });

        var authResult = await authenticator.googleSignUp(code, appRedirect);
        res.status(200).send(authResult.redirect);

    } catch (ex) {
        res.status(400).json({ error: ex.message })
    }

});

router.get("/facebook", async (req, res) => {

    try {
        const { code, state } = req.query;
        const authenticator = new Authenticator();
        
        var appRedirect = state.split(';')[1].split('@')[1];
        var status = state.split(';')[0].split('@')[1];

        if (!code) return res.status(400).json({  error: "invalid code" });

        var authResult = await authenticator.facebookSignUp(code, appRedirect);
        res.status(200).send(authResult.redirect);

    } catch (ex) {
        res.status(400).json({ error: ex.message })
    }

});

router.get("/testUser", Authenticator.UserAuth, async (req, res) => {

    try {
        res.status(200).json(req.subject);

    } catch (ex) {
        res.status(400).json({ error: ex.message })
    }
    
});

router.get("/registration/profile", Authenticator.UserAuth, async (req, res) => {

    try {
        res.status(200).json(req.subject.userProfile);
    } catch (ex) {
        res.status(400).json({ error: ex.message })
    }
    
});