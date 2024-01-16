import { Double, ObjectId } from "mongodb";
import { DBClient } from "../database/database";
import { ClassTransformOptions, Expose, Transform, Type, instanceToInstance, plainToInstance } from 'class-transformer'

const dbName = "TulacikoviaEventsAndAppeals";
const dbCollection = 'EventsAndAppeals';

export enum AppealFilterFields {
    startDate = 'startDate',
    endDate = 'endDate',
    createdOn = 'createdOn',
    organisator = 'organisatorID',
    location = 'location',
    type = 'type'
}

export interface DBFilterOptions<T> {
    limit: number,
    sortBy: T,
    sort: number
}

export enum AppealFilters {
    ACTUAL = 'actual',
    PAST_DATE = 'past_date',
    DRAFTS = 'drafts',
    ARCHIVE = 'archive',
    IN_LOCATION = 'in_location',
    MY_APPEALS = 'my_appeals',
    FEED_APPEALS = 'feed_appeals',
    TYPE = 'type',
    CONTENT_TYPE = 'content_type',
    EXCLUDE = 'exclude',
    FUTURE = 'future'
}

export interface AppealModel {
    id: ObjectId;
    name: string;
    description: string;
    images: string[];
    organisatorID?: ObjectId;
    tags: string[];
    type: AppealType;
    contentType: AppealContentType;
    draft: boolean;
    archived?: boolean;
    createdOn: Date;
    updatedOn: Date;
}

export enum AppealType {
    APPEAL = "APPEAL", EVENT = "EVENT", UNKNOWN = "UNKNOWN"
}

export enum AppealContentType {
    REGULAR = "REGULAR", WALK = "WALK", DONATION = "DONATION", ADOPTION = "ADOPTION"
}

export class Appeal implements AppealModel {
    @Expose({groups: ['update', 'read.public']}) @Transform(({obj, key}) => {
        const objectID = (obj['id'] != null) ? new ObjectId(obj['id']) : new ObjectId(obj['_id'] ?? undefined);
        return objectID;
    })
    id: ObjectId;
    @Expose({groups: ['create', 'update', 'read.public']})
    name: string;
    @Expose({groups: ['create', 'update', 'read.public']})
    description: string;
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Array<string>)
    images: string[];
    @Expose({groups: ['create', 'update', 'read.public']}) @Transform(({obj, key}) => (obj[key] != null) ? new ObjectId(obj[key]) : null)
    organisatorID?: ObjectId | undefined;
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Array<string>)
    tags: string[];
    @Expose({groups: ['create', 'update', 'read.public']})
    type: AppealType = AppealType.APPEAL;
    @Expose({groups: ['create', 'update', 'read.public']})
    draft: boolean;
    @Expose({groups: ['create', 'update', 'read.public']})
    archived?: boolean;
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Date)
    createdOn: Date;
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Date)
    updatedOn: Date;
    @Expose({groups: ['create', 'update', 'read.public']})
    contentType: AppealContentType = AppealContentType.REGULAR;

    constructor(name: string, description: string, tags: string[], images: any[], draft: boolean, id: ObjectId, createdOn?: Date, organisatorID?: ObjectId, archived?: boolean, updatedOn?: Date) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.tags = tags;
        this.images = images;
        this.organisatorID = organisatorID;
        this.draft = draft;
        this.archived = archived;
        this.createdOn = createdOn ?? new Date();
        this.updatedOn = updatedOn ?? new Date();
    }

    transform<T>(options?: ClassTransformOptions | undefined): T {
        if (!(this as unknown as T)) throw new Error('Transforming object of type Appeal, but it\'s content is incompatible with destination type.');
        // var result = plainToInstance<T, any>(T, this, options);
        return this as unknown as T;
    }

    static getFilterQuery(filter: AppealFilters, requiredParam?: any): any {
        switch(filter) {
            case AppealFilters.ACTUAL:
                return { endDate: { $gt: new Date() } }
            case AppealFilters.FUTURE:
                return { startDate: { $gt: new Date() } }
            case AppealFilters.ARCHIVE:
                return { archived: true }
            case AppealFilters.DRAFTS:
                return { draft: true }
            case AppealFilters.MY_APPEALS:
                return { organisatorID: new ObjectId(requiredParam) }
            case AppealFilters.PAST_DATE:
                return { endDate: { $lt: new Date() }}
            case AppealFilters.TYPE:
                return { type: { $in: requiredParam} }
            case AppealFilters.IN_LOCATION:
                return { location: { $near: {
                           $geometry: { type: "Point",  coordinates: [ Number(requiredParam?.lon), Number(requiredParam?.lat) ] },
                           $minDistance: 0,
                           $maxDistance: Number(requiredParam?.limit)
                        }
                    }
                }
            case AppealFilters.EXCLUDE:
                return {_id: { $nin: requiredParam } }
            case AppealFilters.CONTENT_TYPE:
                return {contentType: { $in: requiredParam } }
        }
    }

    async saveToDatabase(): Promise<ObjectId> {
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);

        const result = await collection.insertOne(this);
        return result.insertedId;
    }

    async updateToDabase(): Promise<ObjectId> {
        console.log('Updating content with id: ' + JSON.stringify(this));
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);

        try { 
            const result = await collection.updateOne( {_id: new ObjectId(this.id)}, { $set: this});
            console.log(JSON.stringify(result))
        } catch (ex) {
            console.log((ex as any).message);
        }
        
        return this.id;
    }

    static async getList(query: any, filterOptions: DBFilterOptions<AppealFilterFields>, lastIndex?: number): Promise<Appeal[]> {
        var sort: any = {};

        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        
        sort[filterOptions.sortBy] = parseInt(filterOptions.sort.toString());   
        const appeals = await collection.find<Appeal>(query, {sort: sort}).skip(lastIndex ?? 0).limit(parseInt(filterOptions.limit.toString())).toArray();
        return appeals;
    }

    static async getListByIDs(ids: ObjectId[]) {
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);

        const appeals = await collection.find<Appeal>({ _id: { $in: ids} }).toArray();
        return appeals;
    }

    static async participateOn(appeal: ObjectId, user: ObjectId) {
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaEventsAndAppeals').collection('Participations');

        const existing = await collection.find({ user: new ObjectId(user), appeal: new ObjectId(appeal) }).toArray();
        if(existing.length > 0) throw new Error('Participation for this user on this event already exits.')

        var result = await collection.insertOne({ user: new ObjectId(user), appeal: new ObjectId(appeal) , createdOn: new Date() });
        return result.insertedId;
    }

    static async unparticipateFrom(appeal: ObjectId, user: ObjectId) {
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaEventsAndAppeals').collection('Participations');

        var result = await collection.deleteOne({ user: new ObjectId(user), appeal: new ObjectId(appeal) });
        return result.deletedCount;
    }

    static async getParticipations(user: ObjectId, filterOptions: DBFilterOptions<AppealFilterFields>, startFrom?: number) {
        var sort: any = {};
        var query: any = {user: new ObjectId(user)};

        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaEventsAndAppeals').collection('Participations');

        sort['createdOn'] = parseInt(filterOptions.sort.toString());
        const participations = await collection.find<{_id: ObjectId, user: ObjectId, appeal: ObjectId, createdOn: Date}>(query, {sort: sort}).skip(parseInt(startFrom?.toString() ?? '0') ?? 0).limit(parseInt(filterOptions.limit.toString())).toArray();
        return participations;
    }

    static async getListByParticipations(user: ObjectId, filterOptions: DBFilterOptions<AppealFilterFields>, startFrom?: number) {
        var sort: any = {};

        const participations = await Appeal.getParticipations(user, filterOptions, startFrom);

        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        
        sort[filterOptions.sortBy] = parseInt(filterOptions.sort.toString());
        const appeals = await collection.find<Appeal>({ _id: { $in: participations.map(par => par.appeal)}}, {sort: sort}).limit(parseInt(filterOptions.limit.toString())).toArray();
        return appeals;
    }

    static async isParticipated(user: ObjectId, appeal: ObjectId) {
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaEventsAndAppeals').collection('Participations');

        const existing = await collection.find({ user: new ObjectId(user), appeal: new ObjectId(appeal) }).toArray();
        return existing.length > 0;
    }

    async deleteFromDatabase(caller: ObjectId): Promise<boolean> {
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);

        const deleted = await collection.deleteOne({ _id: new ObjectId(this.id), organisatorID: new ObjectId(caller)});
        return deleted.deletedCount > 0;
    }

    static async deleteById(id: ObjectId, caller: ObjectId) {
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);

        const deleted = await collection.deleteOne({ _id: new ObjectId(id), organisatorID: new ObjectId(caller)});
        return deleted.deletedCount > 0;
    }

}

export interface LocationModel {
    address: string,
    latitude: number,
    longitude: number
}

export class LocationModel {
    @Expose() type: string = "Point";
    @Expose() address!: string;
    @Expose() coordinates!: [number, number] // longitude, latitude
}


export interface EventModel extends AppealModel {
    startDate: Date;
    endDate: Date;
    location: LocationModel;
}

export class Event extends Appeal implements EventModel {

    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Date)
    startDate: Date;
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Date)
    endDate: Date;
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => LocationModel)
    location: LocationModel;
    @Expose({groups: ['create', 'update', 'read.public']})
    type: AppealType = AppealType.EVENT;

    constructor(name: string, description: string, startDate: Date, endDate: Date, tags: string[], images: any[], location: LocationModel, draft: boolean, id: ObjectId, createdOn?: Date, organisatorID?: ObjectId, archived?: boolean) {
        super(name, description, tags, images, draft, id, createdOn, organisatorID, archived);
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
    }
    
    static init({name, description, startDate, endDate, tags, images, location, draft, organisatorID, id, createdOn}: EventModel): Event {
        console.log('Initializating with [id, draftState] ' + [id, draft])
        return new Event(name, description, startDate, endDate, tags, images, location, draft, id, createdOn, organisatorID);
    }

    contentValidation(crud: any): Event {
        if(this.type != AppealType.EVENT) throw new Error('Type of the Event is missing or is not correct.');
        if(this.name == undefined || this.name.length > 50) throw new Error('Event name is not filled or it\'s length is over allowed 50 characters.');
        if(this.description == undefined || this.description.length < 50) throw new Error('Event description is not filled or it\'s length is bellow required 50 characters.');
        if(this.images == undefined || this.images.length < 1) throw new Error('Not enough images attached in the Event. At least 1 image needs to be uploaded.');
        if(this.tags == undefined || this.tags.length < 1) throw new Error('Not enough tags attached in the Event. At least 1 tag needs to be filled.');
        if(this.draft == undefined) throw new Error('Cannot determine draft state of the inserting Event.');
        if(this.startDate == undefined || new Date(this.startDate) < new Date()) throw new Error('Event start date is not filled or is planned in the past.');
        if(this.endDate == undefined || new Date(this.endDate) < new Date(this.startDate)) throw new Error('Event end date is not filled or is planned in before start date.');
        // TODO: In future, parse lat and long and check with reverse geoconding to confirm validity of the location and coordinates
        if(this.location == undefined || this.location.address == '') throw new Error('Event location is not filled or is invalid.');
        if(this.organisatorID == undefined) throw new Error('Event organisator is not defined in the object.');

        return instanceToInstance(this, {groups: [crud], exposeUnsetFields: false, exposeDefaultValues: false, excludeExtraneousValues: true}).sanitize();
    }

    async saveToDatabase(): Promise<ObjectId> {
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);

        const result = await collection.insertOne(this);
        console.log('RESULT: ' + JSON.stringify(result))
        return result.insertedId;
    }

    async updateToDabase(): Promise<ObjectId> {
        console.log('Updating content with id: ' + JSON.stringify(this));
        const connection = await DBClient.connect();
        const collection = connection.db(dbName).collection(dbCollection);
        
        const result = await collection.updateOne({_id: new ObjectId(this.id)}, { $set: this });
        if(result.modifiedCount > 0) return this.id;
        else throw new Error('No update upon received object.');
    }

    sanitize() {
        Object.keys(this).forEach(key => (this as any)[key] === undefined && delete (this as any)[key])
        return this;
    }

    static async getList(query: any, filterOptions: DBFilterOptions<AppealFilterFields>, lastIndex?: number): Promise<Event[]> {
        var appeals = await super.getList(query, filterOptions, lastIndex);
        return plainToInstance<Event, Appeal>(Event, appeals, { groups: ['read.public']})
    }

    // static async getListByOrganisator<T extends Document>(organisator: ObjectId, filterOptions: AppealFilterOptions, lastObject?: ObjectId): Promise<T[]> {
    //     var query: any = { organisatorID: organisator};
    //     var sort: any = {};

    //     const connection = await DBClient.connect();
    //     const collection = connection.db(dbName).collection(dbCollection);

    //     if(lastObject) query['_id'] = { $gt: lastObject};
    //     sort[filterOptions.sortBy] = filterOptions.sort;

    //     const appeals = await collection.find<T>(query, {sort: sort}).limit(filterOptions.limit).toArray();
    //     return appeals;
    // }
    
}