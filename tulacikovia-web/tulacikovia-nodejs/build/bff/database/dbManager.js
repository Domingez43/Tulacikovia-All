"use strict";
// import { log } from "console";
// import { DBClient } from "./database";
// import { UserAttributes,DataAction } from "./userAtributesEnum";
// const dbName = "TulacikoviaAuth";
// const dbCollection = 'credentials';
// export class DBManager{
//     /**
//      * 
//      * @param key - Key to user data stored in DB
//      * @param keyValue - Value of key
//      * @param data Data - to be inserted or updated
//      * @param action - defines action find, insert, update, delete
//      * @returns result of action
//      */
//     async modifyUserData(key: UserAttributes,keyValue: string, data: string, action: DataAction){
//         const connection = await DBClient.connect();
//         try {
//             const collection = connection.db(dbName).collection(dbCollection);
//             const filter = {key : keyValue};
//             console.log("FILTER",filter);
//             switch (action) {
//                 case DataAction.INSERT:
//                     // result = await collection.insertOne(data);
//                     //return result;
//                     break;
//                 case DataAction.DELETE:
//                     const deleted = await collection.findOneAndDelete(filter);
//                     console.log('called: ' + deleted);
//                     return deleted;
//                 case DataAction.FIND:
//                     const found = await collection.findOne(filter);
//                     console.log('FOUND: ' + found);
//                     return found;
//                 case DataAction.UPDATE:
//                     // await collection.updateOne({key: keyValue},data);
//                     //return result;     
//                     break;
//                 default:
//                     break;
//             }
//         } catch (error) {
//             console.error("Change password error:",error);
//         }finally{
//             await connection.close();
//         }
//     }
// }
