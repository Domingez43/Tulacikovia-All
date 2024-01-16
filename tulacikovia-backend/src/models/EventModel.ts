import { DBClient } from "../database/database";

const dbName = "TulacikoviaEventsAndApeals";
const dbCollection = 'EventsAndApeals';



export interface IdkHowToCallThisInterface{
    type: "EVENT" | "APPEAL"
    status: "ACTIVE" | "FINISHED" | "CONCEPT"
    organizator: string,
    name: string,
    tag? : string,
    description?: string,
    picture?: string,
    location: string,
    startDate: string,
    endDate?: string,
}

export class Appeal implements IdkHowToCallThisInterface{
    type: "EVENT" | "APPEAL" = "APPEAL";
    status: "ACTIVE" | "FINISHED" | "CONCEPT" = "CONCEPT";
    organizator!: string;
    name! : string;
    tag?: string;
    description?: string;
    picture?: string;
    location: string;
    startDate: string;

    constructor(organizator: string, name: string, tag: string, description: string, picture: string, location: string, startDate: string) {
        this.organizator = organizator;
        this.name = name;
        this.tag = tag;
        this.description = description;
        this.picture = picture;
        this.location = location;
        this.startDate = startDate;
    }

    async save(){
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try {
            //TODO: WRITE IT INTO DB
        } catch (error) {
            console.log("Save Apeal error: ", error);
            throw error;
        }finally{
            await connection.close();
        }
    }

}