"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticator = exports.CLIENT_SECRET = void 0;
const database_1 = require("../database/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const UserModel_1 = require("../models/UserModel");
const class_transformer_1 = require("class-transformer");
var jwt = require('jsonwebtoken');
const dbName = "TulacikoviaAuth";
const dbCollection = 'credentials';
//? TOTO V PRODUCTIONE BY TU ASI NEMALO BYT NE
// ! URCITE NIE
const GOOGLE_CLIENT_ID = "1075278479401-9hi0tuuvoe2v2o1rnl89so3bdoa8vvkd.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
exports.CLIENT_SECRET = "R?E;%nehTl7'Cb%'YW/<=cfzh|JlP1%hV2*mDOHjSuxQ*.Q6$u6p.O}qfEX.^m>";
class Authenticator {
    async doesUserExists(email) {
        const connection = await database_1.DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try {
            const foundUser = await collection.findOne({ email: email });
            return foundUser !== null;
        }
        catch (error) {
            console.log("does user exists", error);
            throw error;
        }
        finally {
            await connection.close();
        }
    }
    async registerNewUser(email, password) {
        const connection = await database_1.DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try {
            const user = {
                email: email,
                password: password,
            };
            const result = await collection.insertOne(user);
            return result;
        }
        catch (error) {
            console.log("does user exists", error);
            throw error;
        }
        finally {
            await connection.close();
        }
    }
    async registerSocialUser(socialData) {
        const connection = await database_1.DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try {
            const dbCredentialsData = (0, class_transformer_1.instanceToInstance)(socialData, { groups: ['credentials'], excludeExtraneousValues: true, exposeUnsetFields: false });
            const credentials = await collection.insertOne(dbCredentialsData);
            const user = await UserModel_1.UserProfile.createUserProfile(socialData, credentials.insertedId);
            const userProfile = (0, class_transformer_1.instanceToInstance)(user, { groups: ['private'] });
            return userProfile;
        }
        catch (error) {
            console.error("Register new user error: ", error);
            throw error;
        }
        finally {
            await connection.close();
        }
    }
    async hashPassword(password) {
        try {
            const hashedPswrd = await bcryptjs_1.default.hash(password, 2);
            return hashedPswrd;
        }
        catch (error) {
            console.error("Hashing Error: ", error);
            throw new Error("Error hashing password");
        }
    }
    async verifyUser(email, password) {
        const connection = await database_1.DBClient.connect();
        try {
            const collection = connection.db(dbName).collection(dbCollection);
            const user = await collection.findOne({ email: email });
            if (user == null) { // verifying if user exists
                return false;
            }
            const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
            return passwordMatch ? true : false;
        }
        catch (error) {
            console.error("Database error:", error);
            return false;
        }
        finally {
            await connection.close();
        }
    }
    async deleteUser(email) {
        const connection = await database_1.DBClient.connect();
        try {
            const collection = connection.db(dbName).collection(dbCollection);
            const deletedUser = await collection.findOneAndDelete({ email: email });
            return deletedUser.value != null ? true : false;
        }
        catch (error) {
            console.error("Delete user error:", error);
        }
        finally {
            await connection.close();
        }
    }
    async changePassword(resetToken, password) {
        const connection = await database_1.DBClient.connect();
        try {
            const collection = connection.db(dbName).collection(dbCollection);
            const hashedPassword = await this.hashPassword(password);
            const undef = undefined;
            const passwordChange = await collection.updateOne({ resetToken: resetToken }, { $set: {
                    password: hashedPassword,
                    resetToken: undef,
                    resetTokenExpiration: undef
                } });
        }
        catch (error) {
            console.error("Change password error:", error);
        }
        finally {
            await connection.close();
        }
    }
    async generateResetToken(email) {
        const connection = await database_1.DBClient.connect();
        try {
            const collection = connection.db(dbName).collection(dbCollection);
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
            const result = await collection.updateOne({ email: email }, { '$set': {
                    resetToken: resetToken,
                    resetTokenExpiration: resetTokenExpiration
                } });
            console.log("RESULT:", result);
        }
        catch (error) {
            console.error("Reset Token error:", error);
        }
        finally {
            await connection.close();
        }
    }
    async tokenValidator(resetToken) {
        try {
            const expirationTime = await this.getUserResetTokenExpiration(resetToken);
            if (expirationTime == null) {
                return false;
            }
            const actualTime = Date.now();
            if (expirationTime > actualTime) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.log("GetUserResetToken Error:", error);
            return false;
        }
    }
    async getUserResetToken(email) {
        const connection = await database_1.DBClient.connect();
        try {
            const collection = connection.db(dbName).collection(dbCollection);
            const result = await collection.findOne({ email: email });
            if (result) {
                return result.resetToken;
            }
            else {
                console.log('User not found');
                return null;
            }
        }
        catch (error) {
            console.log("GetUserResetToken Error:", error);
        }
        finally {
            await connection.close();
        }
    }
    async getUserResetTokenExpiration(resetToken) {
        const connection = await database_1.DBClient.connect();
        try {
            const collection = connection.db(dbName).collection(dbCollection);
            const result = await collection.findOne({ resetToken: resetToken });
            if (result != null) {
                const resetTokenExp = result.resetTokenExpiration;
                return resetTokenExp;
            }
            else {
                console.log('User not found');
                return null;
            }
        }
        catch (error) {
            console.log("GetUserResetToken Error:", error);
        }
        finally {
            await connection.close();
        }
    }
    async facebookSignUp(code, appUri) {
        const params = new URLSearchParams({
            client_id: '716472803273292',
            client_secret: '4b88fc0b7df8623ba465488b69e1eff4',
            redirect_uri: 'https://relyonproject.com/facebook',
            code: code,
        });
        var userProfile;
        var status;
        const response = await fetch(`https://graph.facebook.com/v4.0/oauth/access_token?${params}`);
        const { access_token } = await response.json();
        const fields = ['id', 'email', 'first_name', 'last_name', 'picture', 'locale'].join(',');
        const userRequest = await fetch(`https://graph.facebook.com/me?fields=${fields}&access_token=${access_token}`);
        const userData = await userRequest.json();
        var socialData = (0, class_transformer_1.plainToInstance)(UserModel_1.FacebookAuthProfile, userData, { groups: ['private'], excludeExtraneousValues: true });
        socialData.accessToken = access_token;
        socialData.type = "FACEBOOK";
        var userExists = await this.doesUserExists(socialData.email);
        if (!userExists) {
            userProfile = await this.registerSocialUser(socialData);
            status = "REGISTERED";
        }
        else {
            userProfile = await UserModel_1.UserProfile.initFromDB(socialData);
            status = "LOGGEDIN";
        }
        if (!userProfile)
            throw new Error('Unable to handle application access through social login for this email address.');
        const jwtAccessData = (0, class_transformer_1.instanceToInstance)(socialData, { groups: ['jwt_access'], excludeExtraneousValues: true });
        const token = jwt.sign({ userProfile: userProfile, authProfile: jwtAccessData }, exports.CLIENT_SECRET, { expiresIn: '6h' });
        return { status: status, redirect: `<script>window.location.replace("${appUri}?state=${status}&token=${token}")</script>` };
    }
    async googleSignUp(code, appUri) {
        var userProfile;
        var status;
        const url = `https://oauth2.googleapis.com/token?code=${code}&client_id=${GOOGLE_CLIENT_ID}&client_secret=${GOOGLE_CLIENT_SECRET}&redirect_uri=https://relyonproject.com/google&grant_type=authorization_code`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${data.id_token}`);
        const verifyData = await verifyResponse.json();
        var socialData = (0, class_transformer_1.plainToInstance)(UserModel_1.GoogleAuthProfile, verifyData, { groups: ['private'], excludeExtraneousValues: true });
        socialData.type = "GOOGLE";
        socialData.accessToken = data.access_token;
        socialData.refreshToken = data.refresh_token;
        socialData.jwtToken = data.id_token;
        var userExists = await this.doesUserExists(socialData.email);
        if (!userExists) {
            userProfile = await this.registerSocialUser(socialData);
            status = "REGISTERED";
        }
        else {
            userProfile = await UserModel_1.UserProfile.initFromDB(socialData);
            status = "LOGGEDIN";
        }
        if (!userProfile)
            throw new Error('Unable to handle application access through social login for this email address.');
        const jwtAccessData = (0, class_transformer_1.instanceToInstance)(socialData, { groups: ['jwt_access'], excludeExtraneousValues: true });
        const token = jwt.sign({ userProfile: userProfile, authProfile: jwtAccessData }, exports.CLIENT_SECRET, { expiresIn: '6h' });
        return { status: status, redirect: `<script>window.location.replace("${appUri}?state=${status}&token=${token}")</script>` };
    }
    /**
     * Verifies an access token and retrieves the associated user profile.
     * This function first decodes the provided access token using JSON Web Token (JWT) and a secret to verify the signature.
     * If the token is valid, it converts the decoded payload to an instance of the UserProfile class using plainToInstance.
     *
     * @param {string} token - The access token to be verified.
     * @returns {Promise<UserProfile>} - A Promise that resolves to the UserProfile instance associated with the provided token.
     * @throws {Error} - If the provided token is not valid or cannot be verified.
     */
    static async verifyAccessToken(token) {
        const decodedToken = await jwt.verify(token, exports.CLIENT_SECRET);
        const payload = await decodedToken;
        return (0, class_transformer_1.plainToInstance)(UserModel_1.UserProfile, payload, { groups: ['private'] });
    }
}
exports.Authenticator = Authenticator;
_a = Authenticator;
/**
 * Middleware function for user authentication, requiring a valid authorization header in the request.
 *
 * This function performs the following steps:
 * 1. Checks if the request has an 'authorization' header, and throws an error if it is missing.
 * 2. Extracts the JSON Web Token (JWT) from the 'authorization' header.
 * 3. Verifies the access token using the Authenticator module.
 * 4. Stores the verified user in the request object.
 * 5. Calls the next middleware function.
 * If any errors occur, the function responds with a 401 status and a JSON object containing the error details.
 *
 * @param {any} request - The incoming HTTP request object.
 * @param {any} response - The outgoing HTTP response object.
 * @param {any} next - The next middleware function to call.
 * @returns {void}
 * @throws {Error} If the authorization header is missing or the token is invalid.
 */
Authenticator.UserAuth = async (request, response, next) => {
    try {
        if (request.headers.authorization === undefined)
            throw new Error('Authorization is required.');
        const token = await request.headers.authorization.split(" ")[1];
        const user = await Authenticator.verifyAccessToken(token);
        request.subject = user;
        next();
    }
    catch (error) {
        response.status(401).json({
            status: "error",
            auth: 'invalid',
            message: 'Your request is invalid.',
            error: error.message,
        });
    }
};
