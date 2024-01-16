import { Collection } from "mongodb";
import { DBClient } from "../database/database";

const dbName = "TulacikoviaUserData";
const dbUserCollection = "User";
const dbOrganizationCollection = "Organization";

export class UserDataManager{

    async updateUserData(userID: string, name: string, profilePicture: string){
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbUserCollection);
        const options = {returnOriginal: false,upsert: true};   
        try{
           const result = await collection.findOneAndUpdate({userID: userID},{userID: userID,name: name, profilePicture: profilePicture},options);
        }catch(error){
        }finally{
            connection.close();
        }
    }
}