import { Expose, Transform, Type, instanceToInstance } from "class-transformer";
import { ObjectId } from "mongodb";
import { DBClient } from "../database/database";
import { DBFilterOptions } from "./AppealModel";

export enum AnimalFilterFields {
    createdOn = 'createdOn',
    owner = 'organisatorID',
    type = 'type'
}

export enum AnimalFilters {
    MALES = 'males',
    FEMALES = 'females',
    CUBS = 'cubs',
    SPIECES = 'spieces',
    FOR_ADOPTION = 'for_adoption',
    ADOPTED = 'adopted',
    MY_ADOPTIONS = 'my_adoptions'
}

export enum AnimalSpieces {
    DOG = "DOG",
    CAT = 'CAT',
    BIRD = "BIRD",
    FISH = "FISH",
    RODENT = "RODENT"
}

export interface AnimalModel {
    id: ObjectId;
    name: string;
    description: string;
    gender: "MALE" | "FEMALE";
    type: AnimalSpieces;
    weight: number;
    birthDate: Date;
    color: string;
    adopted: boolean;
    owner: ObjectId;
    createdOn: Date;
    photos: string[];
    tags: string[];
    breed: string;
}

export class Animal implements AnimalModel {
    @Expose({groups: ['update', 'read.public']}) @Transform(({obj, key}) => {
        if(obj['_id'] != null) return new ObjectId(obj['_id']);
        if(obj['id'] != null) return new ObjectId(obj['id']);
        return null;
    })
    id: ObjectId;
    @Expose({groups: ['create', 'update', 'read.public']})
    name: string;
    @Expose({groups: ['create', 'update', 'read.public']})
    description: string;
    @Expose({groups: ['create', 'update', 'read.public']})
    gender: "MALE" | "FEMALE";
    @Expose({groups: ['create', 'update', 'read.public']})
    type: AnimalSpieces;
    @Expose({groups: ['create', 'update', 'read.public']})
    weight: number;
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Date)
    birthDate: Date;
    @Expose({groups: ['create', 'update', 'read.public']})
    color: string;
    @Expose({groups: ['create', 'update', 'read.public']})
    adopted: boolean;
    @Expose({groups: ['create', 'update', 'read.public']}) @Transform(({obj, key}) => (obj[key] != null) ? new ObjectId(obj[key]) : null)
    owner: ObjectId;
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Date)
    createdOn: Date;
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Array<string>)
    photos: string[];
    @Expose({groups: ['create', 'update', 'read.public']}) @Type(() => Array<string>)
    tags: string[];
    @Expose({groups: ['create', 'update', 'read.public']})
    breed: string;
    
    constructor(id: ObjectId, name: string, description: string, gender: "MALE" | "FEMALE", type: AnimalSpieces, weight: number, birthDate: Date, color: string, adopted: boolean, owner: ObjectId, createdOn: Date, photos: string[], tags: string[], breed: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.gender = gender;
        this.type = type;
        this.weight = weight;
        this.birthDate = birthDate;
        this.color = color;
        this.adopted = adopted;
        this.owner = owner;
        this.createdOn = createdOn;
        this.photos = photos;
        this.tags = tags;
        this.breed = breed;
    }

    static init({ id, name, description, gender, type, weight, birthDate, color, adopted, owner, createdOn, photos, tags, breed}: AnimalModel): Animal {
        console.log('Initializing Animal with [id, adopted] ' + [id, adopted]);
        return new Animal(id, name, description, gender, type, weight, birthDate, color, adopted, owner, createdOn, photos, tags, breed);
    }

    isComplete(): boolean {
        return !!(this.name && this.description && this.gender && this.type && this.weight != null && this.birthDate && this.color && this.adopted != null && this.owner && this.createdOn);
    }

    contentValidation(crud: any): Animal {
        if (this.name == undefined || this.name.length > 50) throw new Error('Animal name is not filled or its length is over the allowed 50 characters.');
        if (this.description == undefined || this.description.length < 50) throw new Error('Animal description is not filled or its length is below the required 50 characters.');
        if (this.gender !== 'MALE' && this.gender !== 'FEMALE') throw new Error('Invalid gender value for the animal.');
        if (this.type == undefined) throw new Error('Animal species is not defined.');
        if (this.weight == undefined || this.weight <= 0) throw new Error('Invalid weight value for the animal.');
        if (this.birthDate == undefined || this.birthDate >= new Date()) throw new Error('Invalid birth date for the animal.');
        if (this.color == undefined || this.color.trim() === '') throw new Error('Animal color is not filled or is invalid.');
        if (this.adopted == undefined) throw new Error('Cannot determine adoption status of the animal.');
        if (this.owner == undefined) throw new Error('Animal owner is not defined in the object.');
        if (this.createdOn == undefined || this.createdOn > new Date()) throw new Error('Invalid creation date for the animal.');
        if (this.photos == undefined || this.photos.length < 1) throw new Error('Not enough photos attached to the animal. At least 1 photo needs to be uploaded.');
        if (this.tags == undefined || this.tags.length < 1) throw new Error('Not enough tags attached to the animal. At least 1 tag needs to be filled.');
        if (this.breed == undefined || this.breed.trim() === '') throw new Error('Animal breed is not filled or is invalid.');
        
        return instanceToInstance(this, {groups: [crud], exposeUnsetFields: false, exposeDefaultValues: false, excludeExtraneousValues: true}).sanitize();
    }

    sanitize() {
        Object.keys(this).forEach(key => (this as any)[key] === undefined && delete (this as any)[key])
        return this;
    }

    async saveToDatabase(): Promise<ObjectId> {
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaAnimals').collection('Profiles');

        const result = await collection.insertOne(this);
        return result.insertedId;
    }

    async updateToDabase(): Promise<ObjectId> {
        console.log('Updating content with id: ' + JSON.stringify(this));
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaAnimals').collection('Profiles');

        try { 
            const result = await collection.updateOne( {_id: new ObjectId(this.id)}, { $set: this });
            console.log(JSON.stringify(result))
        } catch (ex) {
            console.log((ex as any).message);
        }
        
        return this.id;
    }

    async deleteFromDatabase(caller: ObjectId): Promise<boolean> {
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaAnimals').collection('Profiles');

        const deleted = await collection.deleteOne({ _id: new ObjectId(this.id), owner: new ObjectId(caller)});
        return deleted.deletedCount > 0;
    }

    static async deleteById(id: ObjectId, caller: ObjectId) {
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaAnimals').collection('Profiles');

        console.log('DELETING: ' + { _id: new ObjectId(id), owner: new ObjectId(caller)});
        const deleted = await collection.deleteOne({ _id: new ObjectId(id), owner: new ObjectId(caller)});
        return deleted.deletedCount > 0;
    }

    static getFilterQuery(filter: AnimalFilters, requiredParam?: any): any {
        switch(filter) {
            case AnimalFilters.FEMALES:
                return { gender: 'FEMALE' }
            case AnimalFilters.MALES:
                return { gender: 'MALE' }
            case AnimalFilters.SPIECES:
                return { type: { $in: requiredParam } }
            case AnimalFilters.FOR_ADOPTION:
                return { adopted: false };
            case AnimalFilters.ADOPTED:
                return { adopted: true };
            case AnimalFilters.MY_ADOPTIONS:
                return { owner: new ObjectId(requiredParam) };
        }
    }

    static async getList(query: any, filterOptions: DBFilterOptions<AnimalFilterFields>, skip: number = 0): Promise<Animal[]> {
        var sort: any = {};

        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaAnimals').collection('Profiles');
        
        console.log('SKIP: ' + parseInt(skip.toString() ?? '0') ?? 0);
        sort[filterOptions.sortBy] = parseInt(filterOptions.sort.toString());
        const appeals = await collection.find<Animal>(query, {sort: sort}).skip(parseInt(skip.toString() ?? '0') ?? 0).limit(parseInt(filterOptions.limit.toString())).toArray();
        return appeals;
    }

}