import { Expose, Transform, Type, instanceToInstance, plainToInstance } from "class-transformer";
import { ObjectId } from "mongodb";
import { DBClient } from "../database/database";
import 'reflect-metadata';

export interface AuthProfile {
    type: "GOOGLE" | "FACEBOOK" | "EMAIL"
    email: string,
    name?: string,
    surname?: string,
    profilePicture?: string,
    locale?: string,
    jwtToken?: string,
    accessToken?: string,
    refreshToken?: string,
    password?: string,
}

export class EmailAuthProfile implements AuthProfile {
    @Expose({groups: ['jwt_data', 'private', 'credentials']}) @Transform(({obj, key}) => (obj[key] != null) ? obj[key] : "EMAIL")
    type: "GOOGLE" | "FACEBOOK" | "EMAIL" = "EMAIL";
    @Expose({groups: ['jwt_data', 'private', 'credentials']})
    email!: string;
    @Expose({groups: ['jwt_data', 'private', 'credentials']})
    password!: string;
    @Expose({groups: ['jwt_data', 'private']})
    name?: string;
    @Expose({ groups: ['jwt_data', 'private']})
    surname?: string;
    @Expose({name: 'picture', groups: ['jwt_data', 'private']})
    profilePicture?: string;
    @Expose({groups: ['jwt_data', 'private']})
    locale?: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}

export class GoogleAuthProfile implements AuthProfile {
    @Expose({groups: ['jwt_data', 'private', 'credentials']})
    type: "GOOGLE" | "FACEBOOK" = "GOOGLE";
    @Expose({groups: ['jwt_data', 'private', 'credentials']})
    email!: string;
    @Expose({groups: ['jwt_data', 'private']})
    name?: string;
    @Expose({ groups: ['jwt_data', 'private']})
    surname?: string;
    @Expose({name: 'picture', groups: ['jwt_data', 'private']})
    profilePicture!: string;
    @Expose({groups: ['jwt_data', 'private']})
    locale?: string;
    @Expose({groups: ['jwt_access', 'private']})
    jwtToken!: string;
    @Expose({groups: ['jwt_access', 'private']})
    accessToken!: string;
    @Expose({groups: ['jwt_access', 'private']})
    refreshToken!: string;
}

export class FacebookAuthProfile implements AuthProfile {
    @Expose({groups: ['jwt_data', 'private', 'credentials']})
    type: "GOOGLE" | "FACEBOOK" = "FACEBOOK";
    @Expose({groups: ['jwt_data', 'private', 'credentials']})
    email!: string;
    @Expose({name: 'first_name', groups: ['jwt_data', 'private']})
    name?: string;
    @Expose({name: 'last_name', groups: ['jwt_data', 'private']})
    surname?: string;
    @Expose({name: 'picture', groups: ['jwt_data', 'private']}) @Transform(({ key, obj }) => obj['picture']['data']['url'])
    profilePicture!: string;
    @Expose({groups: ['jwt_data', 'private']})
    locale?: string;
    @Expose({groups: ['jwt_access', 'private']})
    accessToken!: string;
}

export class authProfileData implements authProfileData {
    @Expose({name: 'id_token', groups: ['private']}) 
    jwtToken!: string;
    @Expose({name: 'access_token', groups: ['private']})
    accessToken!: string;
    @Expose({name: 'refresh_token', groups: ['private']})
    refreshToken!: string;
    @Expose({ groups: ['private']}) @Type(() => Number)
    expiry?: Number;
}

export interface PlatformUser {
    type: "ORGANISATION" | "USER";
    uid?: ObjectId,
    email: string,
    name?: string,
    surname?: string,
    profilePicture?: string,
    locale?: string,
    createdOn: Date,
    lastLogin: Date,
    save(): Promise<UserProfile | OrganizationProfile>;
}

export class UserProfile implements PlatformUser {
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']}) @Transform(({obj, key}) => (obj['_id'] != null) ? new ObjectId(obj['_id']) : undefined)
    uid?: ObjectId;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    email!: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    name?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    surname?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    profilePicture?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    locale?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']}) @Type(() => Date)
    lastLogin!: Date;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']}) @Type(() => Date)
    createdOn!: Date;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']}) @Transform(({obj, key}) => (obj[key] != null) ? "USER" : undefined)
    type: "ORGANISATION" | "USER" = "USER";

    constructor(email: string, createdOn: Date, lastLogin: Date, name?: string, surname?: string, profilePicture?: string, uid?: ObjectId, locale?: string, jwtToken?: string, accessToken?: string, refreshToken?: string) {
        this.uid = uid;
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.profilePicture = profilePicture;
        this.locale = locale;
        this.createdOn = createdOn ? createdOn : new Date();
        this.lastLogin = lastLogin ? lastLogin : new Date();
    }

    async save() {
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaUserData').collection('userProfiles');
        try{
            const dbProfile = instanceToInstance(this, {groups: ['database_preservable'], excludeExtraneousValues: true, exposeUnsetFields: false})
            Object.keys(dbProfile).forEach((k) => !(dbProfile as any)[k] && delete (dbProfile as any)[k]);

            const dbUser = await collection.insertOne(dbProfile);
            this.uid = dbUser.insertedId;
                
            const userProfile = instanceToInstance<UserProfile>(this, {groups: ['private']});
            return userProfile;

        }catch(error){
            console.error("Register new user error: ",error);
            throw error;
        }finally{
            await connection.close();
        }
    }

    static init(authProfile: AuthProfile, uid?: ObjectId, createdOn?: Date, lastLogin?: Date) {
        return new UserProfile(authProfile.email, new Date(), new Date(), authProfile.name, authProfile.surname, authProfile.profilePicture, uid, authProfile.locale, authProfile.jwtToken, authProfile.accessToken, authProfile.refreshToken);
    }
    
    static async createUserProfile(authProfile: AuthProfile, uid?: ObjectId, preserve: boolean = false): Promise<UserProfile> {
        const completeProfile = UserProfile.init(authProfile);
        var dbProfile = instanceToInstance(completeProfile, {groups: ['database_preservable'], excludeExtraneousValues: true, exposeUnsetFields: false})
        Object.keys(dbProfile).forEach((k) => !(dbProfile as any)[k] && delete (dbProfile as any)[k]);

        if(preserve) await dbProfile.save()
            
        const userProfile = instanceToInstance<UserProfile>(completeProfile, {groups: ['private']});
        return userProfile;
    }

    static async initFromDB(authProfile?: AuthProfile, email?: string): Promise<UserProfile | undefined> {
        if(email == undefined && authProfile == undefined) throw new Error('Either social authentication details or email address needs to be provided to initialize user profile.');
        const loginEmail = (authProfile == undefined) ? email : authProfile.email;

        const connection = await DBClient.connect();
        try{
            const collection = connection.db('TulacikoviaUserData').collection('userProfiles');
            const userData = await collection.findOne({email: loginEmail!});
            
            var userProfile = plainToInstance(UserProfile, userData, {groups: ['private']});
            
            if(userProfile != null) return userProfile;
        
        }catch(error){
            console.error("Database error:", error);
            return undefined;
        }
        finally{
            await connection.close();
        }
    }
}

export enum OrgainzationType {
    NON_PROFIT = "Non-profit organization",
    ENTERPRISE = "Public or private enterprise",
    ASSOCATIONS = "Associations",
    CULTURAL_ORGANISATIONS = "Public cultural organizations",
    SOCIAL_SERVICES_PROVIDER = "Provider of social services"
}

export interface Organization extends PlatformUser {
    formalName?: string,
    formalType?: OrgainzationType,
    identificationNumber?: string,
    bankContact?: string,
}

export class PlatformUser implements PlatformUser {

    static async initFromDB(authProfile?: AuthProfile, email?: string): Promise<PlatformUser | undefined> {
        if(email == undefined && authProfile == undefined) throw new Error('Either social authentication details or email address needs to be provided to initialize user profile.');
        const loginEmail = (authProfile == undefined) ? email : authProfile.email;

        const connection = await DBClient.connect();
        try{
            const collection = connection.db('TulacikoviaUserData').collection('userProfiles');
            const userData: any = await collection.findOne({email: loginEmail!});
            
            var userProfile = plainToInstance((userData.type == "USER") ? UserProfile : OrganizationProfile, userData as unknown, {groups: ['private']});
            if(userProfile != null) return userProfile;
        
        }catch(error){
            console.error("Database error:", error);
            return undefined;
        }
        finally{
            await connection.close();
        }
    }

}

export class OrganizationProfile implements Organization {
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']}) @Transform(({obj, key}) => (obj['_id'] != null) ? new ObjectId(obj['_id']) : undefined)
    uid?: ObjectId;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    email!: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    name?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    identificationNumber?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    bankContact?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    profilePicture?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    locale?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']}) @Type(() => Date)
    lastLogin!: Date;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']}) @Type(() => Date)
    createdOn!: Date;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    formalName?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']}) @Type(() => String)
    formalType?: OrgainzationType;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']})
    surname?: string;
    @Expose({groups: ['internal', 'private', 'public', 'database_preservable']}) @Transform(({obj, key}) => (obj[key] != null) ? "ORGANISATION" : undefined)
    type: "ORGANISATION" | "USER" = "ORGANISATION";

    constructor(email: string, createdOn: Date, lastLogin: Date, name?: string, identificationNumber?: string, bankContact?: string, profilePicture?: string, uid?: ObjectId, locale?: string, jwtToken?: string, accessToken?: string, refreshToken?: string, formalType?: OrgainzationType, formalName?: string) {
        this.uid = uid;
        this.email = email;
        this.name = name;
        this.identificationNumber = identificationNumber;
        this.bankContact = bankContact;
        this.profilePicture = profilePicture;
        this.locale = locale;
        this.createdOn = createdOn ? createdOn : new Date();
        this.lastLogin = lastLogin ? lastLogin : new Date();
        this.formalName = formalName;
        this.formalType = formalType;
    }

    async save() {
        const connection = await DBClient.connect();
        const collection = connection.db('TulacikoviaUserData').collection('userProfiles');
        try{
            const dbProfile = instanceToInstance(this, {groups: ['database_preservable'], excludeExtraneousValues: true, exposeUnsetFields: false})
            Object.keys(dbProfile).forEach((k) => !(dbProfile as any)[k] && delete (dbProfile as any)[k]);

            const dbUser = await collection.insertOne(dbProfile);
            this.uid = dbUser.insertedId;
                
            const userProfile = instanceToInstance<OrganizationProfile>(this, {groups: ['private']});
            return userProfile;

        }catch(error){
            console.error("Register new user error: ",error);
            throw error;
        }finally{
            await connection.close();
        }
    }

    static init(authProfile: AuthProfile, uid?: ObjectId, identificationNumber?: string, bankContact?: string, formalName?: string, formalType?: OrgainzationType, createdOn?: Date, lastLogin?: Date) {
        return new OrganizationProfile(authProfile.email, new Date(), new Date(), authProfile.name, identificationNumber, bankContact, authProfile.profilePicture, uid, authProfile.locale, authProfile.jwtToken, authProfile.accessToken, authProfile.refreshToken, formalType, formalName);
    }

    static async createOrganisationProfile(authProfile: AuthProfile, uid?: ObjectId, preserve: boolean = false): Promise<OrganizationProfile> {
        const completeProfile = OrganizationProfile.init(authProfile);
        var dbProfile = instanceToInstance(completeProfile, {groups: ['database_preservable'], excludeExtraneousValues: true, exposeUnsetFields: false})
        Object.keys(dbProfile).forEach((k) => !(dbProfile as any)[k] && delete (dbProfile as any)[k]);

        if(preserve) await dbProfile.save()
            
        const userProfile = instanceToInstance<OrganizationProfile>(completeProfile, {groups: ['private']});
        return userProfile;
    }

}

 