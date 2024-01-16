import { Expose, Transform, Type, instanceToInstance, plainToInstance } from "class-transformer";
import { APIClient } from "../apis/ServerRequests";

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
    type: "GOOGLE" | "FACEBOOK" | "EMAIL" = "EMAIL";
    email!: string;
    password!: string;
    name?: string;
    surname?: string;
    profilePicture?: string;
    locale?: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}


export class GoogleAuthProfile implements AuthProfile {
    type: "GOOGLE" | "FACEBOOK" | "EMAIL" = "GOOGLE";
    email!: string;
    name?: string | undefined;
    surname?: string | undefined;
    profilePicture?: string | undefined;
    locale?: string | undefined;
    jwtToken?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    password?: string | undefined;
    
    async finishRegistration(subject: OrganizationProfile | UserProfile, token: string, authType: 'email' | 'social') {
        var data: any = {}
        var endpoint = '';

        switch(subject.type){
            case "ORGANIZATION":
                var subj = subject as OrganizationProfile;
                data['formal_name'] = subj.formalName;
                data['formal_type'] = subj.formalType;
                data['identification_number'] = subj.identificationNumber;
                data['bank_contact'] = subj.bankContact;
                endpoint = 'registration/organisation/' + authType + '/finish';
                break;
            case "USER":
                endpoint = 'registration/user/' + authType + '/finish';
                break;
        }

        var result = await APIClient.bffRequest(endpoint, {method: 'POST', data: data}, token);
        return {status: result.data.status, token: result.data.token}
    }

}

export class FacebookAuthProfile implements AuthProfile {
    type: "GOOGLE" | "FACEBOOK" | "EMAIL" = "FACEBOOK";
    email!: string;
    name?: string | undefined;
    surname?: string | undefined;
    profilePicture?: string | undefined;
    locale?: string | undefined;
    jwtToken?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    password?: string | undefined;

}

export interface PlatformUser {
    type: "ORGANIZATION" | "USER";
    uid?: string,
    email: string,
    name?: string,
    surname?: string,
    profilePicture?: string,
    locale?: string,
    createdOn: Date,
    lastLogin: Date,
}

export class PlatformUser implements PlatformUser {

    // static async retrieveUsingLogin(email: string, password: string) {

    // }

    // static async retrieveUsingToken(token: string) {

    // }

    async finishRegistration(token: string, authType: 'email' | 'social') {
        var data: any = {}
        var endpoint = '';

        switch(this.type){
            case "ORGANIZATION":
                var subj = this as OrganizationProfile;
                data['formal_name'] = subj.formalName;
                data['formal_type'] = subj.formalType;
                data['identification_number'] = subj.identificationNumber;
                data['bank_contact'] = subj.bankContact;
                endpoint = 'registration/organisation/' + authType + '/finish';
                break;
            case "USER":
                endpoint = 'registration/user/' + authType + '/finish';
                break;
        }

        var result = await APIClient.bffRequest(endpoint, {method: 'POST', data: data}, token);
        console.log(JSON.stringify(result.data));
        return {status: result.data.status, token: result.data.token}
    }

}

export class UserProfile implements PlatformUser {
    uid?: string;
    email!: string;
    name?: string;
    surname?: string;
    profilePicture?: string;
    locale?: string;
    lastLogin!: Date;
    createdOn!: Date;
    type: "ORGANIZATION" | "USER" = "USER";

    constructor(email: string, createdOn: Date, lastLogin: Date, name?: string, surname?: string, profilePicture?: string, uid?: string, locale?: string, jwtToken?: string, accessToken?: string, refreshToken?: string) {
        this.uid = uid;
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.profilePicture = profilePicture;
        this.locale = locale;
        this.createdOn = createdOn ? createdOn : new Date();
        this.lastLogin = lastLogin ? lastLogin : new Date();
    }

    async finishRegistration(token: string, authType: 'email' | 'social'): Promise<{ status: any; token: any; }> {
        var data: any = {}
        var endpoint = '';

        switch(this.type){
            case "ORGANIZATION":
                var subj = this as OrganizationProfile;
                data['formal_name'] = subj.formalName;
                data['formal_type'] = subj.formalType;
                data['identification_number'] = subj.identificationNumber;
                data['bank_contact'] = subj.bankContact;
                data['name'] = subj.name;
                endpoint = 'registration/organisation/' + authType + '/finish';
                break;
            case "USER":
                data['name'] = this.name;
                endpoint = 'registration/user/' + authType + '/finish';
                break;
        }

        var result = await APIClient.bffRequest(endpoint, {method: 'POST', data: data}, token);
        console.log(JSON.stringify(result.data));
        return {status: result.data.status, token: result.data.token}
    }

    static init(authProfile: AuthProfile, uid?: string, createdOn?: Date, lastLogin?: Date) {
        return new UserProfile(authProfile.email, new Date(), new Date(), authProfile.name, authProfile.surname, authProfile.profilePicture, uid, authProfile.locale, authProfile.jwtToken, authProfile.accessToken, authProfile.refreshToken);
    }

    static async createUserProfile(authProfile: AuthProfile, uid?: string): Promise<UserProfile> {
        const completeProfile = UserProfile.init(authProfile);
        var dbProfile = instanceToInstance(completeProfile, {groups: ['database_preservable'], excludeExtraneousValues: true, exposeUnsetFields: false})
        Object.keys(dbProfile).forEach((k) => !(dbProfile as any)[k] && delete (dbProfile as any)[k]);
            
        const userProfile = instanceToInstance<UserProfile>(completeProfile, {groups: ['private']});
        return userProfile;
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

export class OrganizationProfile implements Organization {
    uid?: string;
    email!: string;
    name?: string;
    identificationNumber?: string;
    bankContact?: string;
    profilePicture?: string;
    locale?: string;
    lastLogin!: Date;
    createdOn!: Date;
    formalName?: string;
    formalType?: OrgainzationType;
    surname?: string;
    type: "ORGANIZATION" | "USER" = "ORGANIZATION";

    constructor(email: string, createdOn: Date, lastLogin: Date, name?: string, identificationNumber?: string, bankContact?: string, profilePicture?: string, uid?: string, locale?: string, jwtToken?: string, accessToken?: string, refreshToken?: string, formalType?: OrgainzationType, formalName?: string) {
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

    static init(authProfile: AuthProfile, uid?: string, identificationNumber?: string, bankContact?: string, formalName?: string, formalType?: OrgainzationType, createdOn?: Date, lastLogin?: Date) {
        return new OrganizationProfile(authProfile.email, new Date(), new Date(), authProfile.name, identificationNumber, bankContact, authProfile.profilePicture, uid, authProfile.locale, authProfile.jwtToken, authProfile.accessToken, authProfile.refreshToken, formalType, formalName);
    }

    static async createOrganisationProfile(authProfile: AuthProfile, uid?: string): Promise<OrganizationProfile> {
        const completeProfile = OrganizationProfile.init(authProfile);
        var dbProfile = instanceToInstance(completeProfile, {groups: ['database_preservable'], excludeExtraneousValues: true, exposeUnsetFields: false})
        Object.keys(dbProfile).forEach((k) => !(dbProfile as any)[k] && delete (dbProfile as any)[k]);

        const userProfile = instanceToInstance<OrganizationProfile>(completeProfile, {groups: ['private']});
        return userProfile;
    }

    async finishRegistration(token: string, authType: 'email' | 'social'): Promise<{ status: any; token: any; }> {
        var data: any = {}
        var endpoint = '';

        switch(this.type){
            case "ORGANIZATION":
                var subj = this as OrganizationProfile;
                data['formal_name'] = subj.formalName;
                data['formal_type'] = subj.formalType;
                data['identification_number'] = subj.identificationNumber;
                data['bank_contact'] = subj.bankContact;
                endpoint = 'registration/organisation/'+ authType +'/finish';
                break;
            case "USER":
                endpoint = 'registration/user/' + authType + '/finish';
                break;
        }

        var result = await APIClient.bffRequest(endpoint, {method: 'POST', data: data}, token);
        return {status: result.data.status, token: result.data.token}
    }

}