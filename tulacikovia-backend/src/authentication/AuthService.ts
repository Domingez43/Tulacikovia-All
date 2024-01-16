import { transpileModule } from "reflec-ts";
import { DBClient } from "../database/database";
// import bcrypt from 'bcryptjs';
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
// TODO: NO TA PTM SA TO PORIESI :D
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