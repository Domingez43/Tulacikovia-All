"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataManager = void 0;
const database_1 = require("../database/database");
const dbName = "TulacikoviaUserData";
const dbUserCollection = "User";
const dbOrganizationCollection = "Organization";
class UserDataManager {
    async updateUserData(userID, name, profilePicture) {
        const connection = await database_1.DBClient.connect();
        const collection = connection.db(dbName).collection(dbUserCollection);
        const options = { returnOriginal: false, upsert: true };
        try {
            const result = await collection.findOneAndUpdate({ userID: userID }, { userID: userID, name: name, profilePicture: profilePicture }, options);
        }
        catch (error) {
        }
        finally {
            connection.close();
        }
    }
}
exports.UserDataManager = UserDataManager;
