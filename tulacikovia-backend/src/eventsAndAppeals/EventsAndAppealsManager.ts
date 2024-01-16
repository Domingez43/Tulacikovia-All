import "reflect-metadata";
import { transpileModule } from "reflec-ts";
import { DBClient, DatabaseHelper } from "../database/database";
import { ObjectId } from "mongodb";
import { Appeal, DBFilterOptions, AppealFilters, AppealType, Event, AppealFilterFields } from "../models/AppealModel";
import { instanceToInstance, plainToInstance } from "class-transformer";
import { Console } from "console";

const dbName = "TulacikoviaEventsAndAppeals";
const dbCollection = 'EventsAndAppeals';

export class EventsAndAppealsManager {

    async createAppeal(organizator: string, name: string, tag: string, description: string, picture: string, location: string, startDate: string) {
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        const actualTime = Date.now();
        try {
            const appeal = {
                type: "APPEAL",
                status: "CONCEPT",
                organizator: organizator,
                name: name,
                tag: tag,
                description: description,
                picture: picture,
                location: location,
                startDate: startDate,
                createdOn: actualTime,
                latestEdit: null
            }
            const result = await collection.insertOne(appeal);
            return result;
        } catch (error) {
            console.log("Creating appeal error",error);
        }finally{
            await connection.close();
        }
    }


    async createEvent(organizator: string, name: string, tag: string, description: string, picture: string, location: string, startDate: string, endDate: string){
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        const actualTime = Date.now();
        try {
            const appeal = {
                type: "EVENT",
                status: "CONCEPT",
                organizator: organizator,
                name: name,
                tag: tag,
                description: description,
                picture: picture,
                location: location,
                startDate: startDate,
                endDate: endDate,
                createdOn: actualTime,
                latestEdit: null
            }
            const result = await collection.insertOne(appeal);
            return result;
        } catch (error) {
            console.log("Creating appeal error",error);
        }finally{
            await connection.close();
        }
    }


    async editEventOrAppeal(status: string, name: string, tag: string, description: string, picture: string, location: string, startDate: string){
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try {
            const actualTime = Date.now()
            const eventOrAppealUpdate = await collection.updateOne({name: name},
                { $set: {
                    type: "APPEAL",
                status: "CONCEPT",
                name: name,
                tag: tag,
                description: description,
                picture: picture,
                location: location,
                startDate: startDate,
                latestEdit: actualTime
                }});

            const result = await collection.insertOne(eventOrAppealUpdate);
            return result;
        } catch (error) {
            console.log("Creating appeal error",error);
        }finally{
            await connection.close();
        }
    }


    async isActiveEventOrAppealWithSameName(name: string){
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try {
            const result = await collection.findOne({name: name,status: 'ACTIVE'})
            return result == null ? false : true;
        } catch (error) {
            console.log("ERROR",error)
        }finally{
            await connection.close();
        }
    }
    

    async getOrganizator(id: string){
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try {
            const result = await collection.findOne({_id: new ObjectId(id)})
            if(result != null){
                return result.email
            }
            return null
        } catch (error) {
            console.log("ERROR",error)
        }finally{
            await connection.close();
        }
    }

 
    verifyEditor(editor: string, organizator: string){
        if(editor == organizator && (editor != null || organizator != null)){
            return true
        }else{
            return false
        }
    }


    //TODO: what to verify in description, picture, location ??
    atributesVerification(type: string, description: string, picture: string, location: string,startDate: string, endDate: string){
        if(type != "APPEAL" && type != "EVENT"){
            return false;
        }
        const actualTime = Date.now()
        if(parseInt(startDate) < actualTime || parseInt(endDate) < actualTime){
            return false;
        }
        if(parseInt(startDate) > parseInt(endDate)){
            return false;
        }
        return true;
    }


    async getEventOrAppeal(id: string){
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        try {
            const result = await collection.findOne({_id: new ObjectId(id)})
            return result;
        } catch (error) {
            console.log("ERROR",error)
        }finally{
            connection.close();
        }
    }

    async processWithGeneralType(crud: "create" | "update" | "delete", content: Appeal, author: ObjectId): Promise<ObjectId> {
        // Assign current logged user to the content as author
        content.organisatorID = author;
        if(crud == 'create') content.createdOn = new Date();
        else content.updatedOn = new Date();

        switch(content.type) {
            case AppealType.APPEAL:
                var appeal = plainToInstance<Appeal, any>(Appeal, content, {groups: [crud], exposeUnsetFields: false});
                if(crud == 'create') return appeal.saveToDatabase();
                if(crud == 'update') return appeal.updateToDabase();

            case AppealType.EVENT:
                var event = plainToInstance<Event, Appeal>(Event, content, {groups: [crud], exposeUnsetFields: false});

                console.log('Is draft: ' + JSON.stringify(event));

                if(crud == 'create') return (event.draft) ? event.saveToDatabase() : event.contentValidation(crud).saveToDatabase();
                if(crud == 'update') return (event.draft) ? event.updateToDabase() : event.contentValidation(crud).updateToDabase();

            default:
                throw new Error('Unable to identify content type parsed from input object, insert denied.');
        }
    }

    async getListWithGeneralType(organisator: ObjectId, applyFilters: AppealFilters[], filterOptions: DBFilterOptions<AppealFilterFields>, lastIndex?: number, params?: any[]): Promise<(Appeal | Event)[]> {
        console.log(applyFilters);
        var targetFilters = applyFilters.map((filter) => {
            switch(filter) {
                case AppealFilters.MY_APPEALS:
                    return Appeal.getFilterQuery(filter, organisator);
                case AppealFilters.TYPE:
                    if(!params) return;
                    var param = DatabaseHelper.getValueFromPairsBy('type', params);
                    var items = param.split(';');
                    return Appeal.getFilterQuery(filter, items);
                case AppealFilters.IN_LOCATION:
                    if(!params) return;
                    var lon = DatabaseHelper.getValueFromPairsBy('lon', params);
                    var lat = DatabaseHelper.getValueFromPairsBy('lat', params);
                    var limit = DatabaseHelper.getValueFromPairsBy('limit', params);
                    return Appeal.getFilterQuery(filter, {lon: lon, lat: lat, limit: limit});
                case AppealFilters.EXCLUDE:
                    if(!params) return;
                    var itemsStr = DatabaseHelper.getValueFromPairsBy('exclude', params);
                    var items = itemsStr.split(';').map((str: string) => new ObjectId(str));
                    return Appeal.getFilterQuery(filter, items);
                case AppealFilters.CONTENT_TYPE:
                    if(!params) return;
                    var itemsStr = DatabaseHelper.getValueFromPairsBy('content_type', params);
                    var items = itemsStr.split(';');
                    return Appeal.getFilterQuery(filter, items);
                default:
                    return Appeal.getFilterQuery(filter);
            }
        })

        var content: (Appeal | Event)[] = (await Appeal.getList(Object.assign({}, ...targetFilters), filterOptions, lastIndex)).filter(obj => obj.type != undefined).map(object => {
            if(object.type == AppealType.EVENT) return plainToInstance(Event, object, { groups: ['read.public'], strategy: 'excludeAll'}).sanitize();
            else return plainToInstance(Appeal, object, { groups: ['read.public'], strategy: 'excludeAll'});
        });
        return content;
    }

    async getListByIDs(ids: ObjectId[]) {
        const _ids = ids.map(id => new ObjectId(id));
        var content: (Appeal | Event)[] = (await Appeal.getListByIDs(_ids)).map(object => {
            if(object.type == AppealType.EVENT) return plainToInstance(Event, object, { groups: ['read.public'], strategy: 'excludeAll'}).sanitize();
            else return plainToInstance(Appeal, object, { groups: ['read.public'], strategy: 'excludeAll'});
        });
        return content;
    }

    async getListFromUserPaticipations(user: ObjectId, filterOptions: DBFilterOptions<AppealFilterFields>, startFrom?: number) {
        var content: (Appeal | Event)[] = (await Appeal.getListByParticipations(user, filterOptions, startFrom)).map(object => {
            if(object.type == AppealType.EVENT) return plainToInstance(Event, object, { groups: ['read.public']});
            else return plainToInstance(Appeal, object, { groups: ['read.public']});
        });
        return content;
    }

    async deleteAppeal(appeal: Event | Appeal | string, caller: string){
        const _appeal = ((appeal as Event | Appeal).id) ? plainToInstance(Appeal, appeal, { strategy: 'exposeAll', groups: ['update'] }) : undefined;
        return (_appeal) ? await (_appeal as Appeal).deleteFromDatabase(new ObjectId(caller)) : Appeal.deleteById(new ObjectId(appeal as string), new ObjectId(caller));
    }

}