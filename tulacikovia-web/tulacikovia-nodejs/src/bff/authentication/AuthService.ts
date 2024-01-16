import { transpileModule } from "reflec-ts";
import { DBClient } from "../database/database";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { log } from "console";
import { FacebookAuthProfile, GoogleAuthProfile, OrganizationProfile, PlatformUser, authProfileData, AuthProfile, UserProfile } from "../models/UserModel";
import { instanceToInstance, plainToInstance } from "class-transformer";
import { ObjectId } from "mongodb";

var jwt = require('jsonwebtoken');

const dbName = "TulacikoviaAuth";
const dbCollection = 'credentials';
 
//? TOTO V PRODUCTIONE BY TU ASI NEMALO BYT NE
// ! URCITE NIE
const GOOGLE_CLIENT_ID = "1075278479401-9hi0tuuvoe2v2o1rnl89so3bdoa8vvkd.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
export const CLIENT_SECRET = "R?E;%nehTl7'Cb%'YW/<=cfzh|JlP1%hV2*mDOHjSuxQ*.Q6$u6p.O}qfEX.^m>"

export class Authenticator {
    

    async doesUserExists(email: string): Promise<boolean> {
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        
        try {
            const foundUser = await collection.findOne({ email: email });
            return foundUser !== null;
        } catch (error) {
            console.log("does user exists",error);
            throw error;
        } finally {
            await connection.close();
        }     
    }

    async doesUserProfileExists(forUserEmail: string): Promise<ObjectId | undefined> {
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaUserData').collection('userProfiles');

        try {
            const foundProfile = await collection.findOne({ email: forUserEmail });
            return foundProfile?._id;
        } catch (error) {
            console.log("does user exists",error);
            throw error;
        } finally {
            await connection.close();
        }     
    }

    async getUserID(email: string): Promise<ObjectId | undefined> {
        
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        
        try {
            const foundUser = await collection.findOne({ email: email });
            return foundUser?._id;
        } catch (error) {
            console.log("does user exists",error);
            throw error;
        } finally {
            await connection.close();
        }     
    }

    async registerNewUser(email : string, password: string){

        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try {
            const user = {
                email: email,
                password: password,
            };
            const result = await collection.insertOne(user);
            return result;
        } catch (error) {
            console.log("does user exists",error);
            throw error;

        } finally {
            await connection.close();

        }    
    }

    async registerCredentials(socialData: AuthProfile) {
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try{

            // Registers new credentials
            const dbCredentialsData = instanceToInstance(socialData, {groups: ['credentials'], excludeExtraneousValues: true, exposeUnsetFields: false})
            const _ = await collection.insertOne(dbCredentialsData);

        }catch(error){
            console.error("Register new user error: ",error);
            throw error;
        }finally{
            await connection.close();
        }
    }

    async finishRegistration(platformUser: PlatformUser, socialData: AuthProfile) {
        if(await this.doesUserProfileExists(platformUser.email)) throw new Error('Cannot create new user profile because userProfile already exists');
        var savedUser = await platformUser.save()
        const token = jwt.sign({userProfile: savedUser, authProfile: socialData}, CLIENT_SECRET, { expiresIn: '6h' });
        return token;
    }


    async hashPassword(password: string){
        try {
            const hashedPswrd = await bcrypt.hash(password,2);
            return hashedPswrd;
        } catch (error) {
            console.error("Hashing Error: ", error);
            throw new Error("Error hashing password");
        }
    }


    async verifyUser(email: string, password: string, isSocialLogin = false): Promise<boolean> {
        const connection = await DBClient.connect();
        try{
            const collection = connection.db(dbName).collection(dbCollection);
            const credentials = await collection.findOne({email: email});
            
            // verifying if user exists
            if(credentials == null || (!isSocialLogin && credentials.type != undefined)) return false;

            const passwordMatch = await bcrypt.compare(password, credentials.password);
            return passwordMatch ? true : false;
            
        }catch(error){
            console.error("Database error:", error);
            return false;
        }
        finally{
            await connection.close();
        }
    }


    async deleteUser(email: string){
        const connection = await DBClient.connect();
        try{
            const collection = connection.db(dbName).collection(dbCollection);
            const deletedUser = await collection.findOneAndDelete({email: email});

            return deletedUser.value != null ? true : false; 

        }catch(error){
            console.error("Delete user error:", error);
        }finally{
            await connection.close();
        }
    }


    async changePassword(resetToken: string, password: string){
        const connection = await DBClient.connect();
        try{
            const collection = connection.db(dbName).collection(dbCollection);
            
            const hashedPassword = await this.hashPassword(password);
            const undef = undefined;
            
            const passwordChange = await collection.updateOne({resetToken: resetToken},
                                        { $set: {
                                            password: hashedPassword,
                                            resetToken : undef,
                                            resetTokenExpiration : undef
                                        }});

        }catch(error){
            console.error("Change password error:",error);
        }finally{
            await connection.close();
        }
    }


    async generateResetToken(email: string){
        const connection = await DBClient.connect();
        try{
            const collection = connection.db(dbName).collection(dbCollection);

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

            const result = await collection.updateOne({email: email},
                                            {'$set' : {
                                                resetToken : resetToken,
                                                resetTokenExpiration : resetTokenExpiration 
                                            }});
            console.log("RESULT:",result);
        }catch(error){
            console.error("Reset Token error:", error);
        }finally{
            await connection.close();
        }

    }


    async tokenValidator(resetToken: string){
        try{
            const expirationTime = await this.getUserResetTokenExpiration(resetToken);
            if(expirationTime == null){ return false;}
            
            const actualTime = Date.now();

            return expirationTime > actualTime ? true : false;
            
        }catch(error){
            console.log("GetUserResetToken Error:",error);
            return false;
        }
    }


    async getUserResetToken(email: string){
        const connection = await DBClient.connect();
        try {
            const collection = connection.db(dbName).collection(dbCollection);
            const result = await collection.findOne({email: email});
            
            if (result){
                return result.resetToken;
              } else {
                console.log('User not found');
                return null;
              }
        } catch (error) {
            console.log("GetUserResetToken Error:",error);
        }finally{
            await connection.close();
        }
    }


    async getUserResetTokenExpiration(resetToken: string){
        const connection = await DBClient.connect();
        try {
            const collection = connection.db(dbName).collection(dbCollection);
            const result = await collection.findOne({resetToken: resetToken});
            
            if (result != null) {
                const resetTokenExp = result.resetTokenExpiration;
                return resetTokenExp;
              } else {
                console.log('User not found');
                return null;
              }
        } catch (error) {
            console.log("GetUserResetToken Error:",error);
        }finally{
            await connection.close();
        }
    }

    async facebookSignUp(code: string, appUri: string): Promise<{ status: string; redirect: string; }> {

        const params = new URLSearchParams({
            client_id: '716472803273292',
            client_secret: '4b88fc0b7df8623ba465488b69e1eff4',
            redirect_uri: 'https://relyonproject.com/facebook',
            code: code,
        });
        var userProfile: PlatformUser | undefined;
        var status: string;
          
        const response = await fetch(`https://graph.facebook.com/v4.0/oauth/access_token?${params}`);
        const { access_token }: any = await response.json();
    
        const fields = ['id', 'email', 'first_name', 'last_name', 'picture', 'locale'].join(',');
        const userRequest = await fetch(`https://graph.facebook.com/me?fields=${fields}&access_token=${access_token}`);
        const userData: any = await userRequest.json();

        var socialData = plainToInstance(FacebookAuthProfile, userData, {groups: ['private'], excludeExtraneousValues: true});
        socialData.accessToken = access_token;
        socialData.type = "FACEBOOK";

        var userExists = await this.doesUserExists(socialData.email);
        if(!userExists) {
            await this.registerCredentials(socialData);
            status = "REGISTERED";
        } else {
            userProfile = await PlatformUser.initFromDB(socialData);
            if (!userProfile) throw new Error('Unable to handle application access through social login for this email address.')
            status = "LOGGEDIN";
        }

        const jwtAccessData = instanceToInstance(socialData, { groups: ['jwt_access'], excludeExtraneousValues: true});
        const token = jwt.sign({userProfile: (status == "LOGGEDIN" ? userProfile : socialData), authProfile: jwtAccessData}, CLIENT_SECRET, { expiresIn: '6h' });

        return { status: status, redirect: `<script>window.location.replace("${appUri}?state=${status}&token=${token}")</script>`}
    }

    async googleSignUp(code: string, appUri: string): Promise<{ status: string; redirect: string; }> {
        
        var userProfile: PlatformUser | undefined;
        var status: string;

        const url = `https://oauth2.googleapis.com/token?code=${code}&client_id=${GOOGLE_CLIENT_ID}&client_secret=${GOOGLE_CLIENT_SECRET}&redirect_uri=https://relyonproject.com/google&grant_type=authorization_code`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data: any = await response.json();

        const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${data.id_token}`);
        const verifyData: any = await verifyResponse.json();

        var socialData = plainToInstance(GoogleAuthProfile, verifyData, {groups: ['private'], excludeExtraneousValues: true});
        socialData.type = "GOOGLE";
        socialData.accessToken = data.access_token;
        socialData.refreshToken = data.refresh_token;
        socialData.jwtToken = data.id_token;
        
        var userExists = await this.doesUserExists(socialData.email);
        var profileExists = await this.doesUserProfileExists(socialData.email);
        if(!userExists) {
            await this.registerCredentials(socialData);
            status = "REGISTERED";
        } else if(profileExists) {
            userProfile = await PlatformUser.initFromDB(socialData);
            if (!userProfile) throw new Error('Unable to handle application access through social login for this email address.')
            status = "LOGGEDIN";
        } else {
            status = "REGISTERED";
        }

        const jwtAccessData = instanceToInstance(socialData, { groups: ['jwt_access'], excludeExtraneousValues: true});
        const token = jwt.sign({userProfile: (status == "LOGGEDIN" ? userProfile : socialData), authProfile: jwtAccessData}, CLIENT_SECRET, { expiresIn: '6h' });
        
        return { status: status, redirect: `<script>window.location.replace("${appUri}?state=${status}&token=${token}")</script>`}
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
    static async verifyAccessToken(token: string): Promise<unknown> {
        const decodedToken = await jwt.verify(token, CLIENT_SECRET);
        return await decodedToken;
    }

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
    static UserAuth = async (request: any, response: any, next: any): Promise<void> => {
        try {
            if(request.headers.authorization === undefined) throw new Error('Authorization is required.');
            const token = await request.headers.authorization.split(" ")[1];
            const user = await Authenticator.verifyAccessToken(token);
            request.subject = user;
            next();
        } catch (error: any) {
            response.status(401).json({
                status: "error",
                auth: 'invalid',
                message: 'Your request is invalid.',
                error: error.message,
            });
        }
    };
}