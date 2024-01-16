"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = exports.authProfileData = exports.FacebookAuthProfile = exports.GoogleAuthProfile = void 0;
const class_transformer_1 = require("class-transformer");
const mongodb_1 = require("mongodb");
const database_1 = require("../database/database");
class GoogleAuthProfile {
    constructor() {
        this.type = "GOOGLE";
    }
}
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_data', 'private', 'credentials'] }),
    __metadata("design:type", String)
], GoogleAuthProfile.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_data', 'private', 'credentials'] }),
    __metadata("design:type", String)
], GoogleAuthProfile.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_data', 'private'] }),
    __metadata("design:type", String)
], GoogleAuthProfile.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_data', 'private'] }),
    __metadata("design:type", String)
], GoogleAuthProfile.prototype, "surname", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'picture', groups: ['jwt_data', 'private'] }),
    __metadata("design:type", String)
], GoogleAuthProfile.prototype, "profilePicture", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_data', 'private'] }),
    __metadata("design:type", String)
], GoogleAuthProfile.prototype, "locale", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_access', 'private'] }),
    __metadata("design:type", String)
], GoogleAuthProfile.prototype, "jwtToken", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_access', 'private'] }),
    __metadata("design:type", String)
], GoogleAuthProfile.prototype, "accessToken", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_access', 'private'] }),
    __metadata("design:type", String)
], GoogleAuthProfile.prototype, "refreshToken", void 0);
exports.GoogleAuthProfile = GoogleAuthProfile;
class FacebookAuthProfile {
    constructor() {
        this.type = "FACEBOOK";
    }
}
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_data', 'private', 'credentials'] }),
    __metadata("design:type", String)
], FacebookAuthProfile.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_data', 'private', 'credentials'] }),
    __metadata("design:type", String)
], FacebookAuthProfile.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'first_name', groups: ['jwt_data', 'private'] }),
    __metadata("design:type", String)
], FacebookAuthProfile.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'last_name', groups: ['jwt_data', 'private'] }),
    __metadata("design:type", String)
], FacebookAuthProfile.prototype, "surname", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'picture', groups: ['jwt_data', 'private'] }),
    (0, class_transformer_1.Transform)(({ key, obj }) => obj['picture']['data']['url']),
    __metadata("design:type", String)
], FacebookAuthProfile.prototype, "profilePicture", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_data', 'private'] }),
    __metadata("design:type", String)
], FacebookAuthProfile.prototype, "locale", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['jwt_access', 'private'] }),
    __metadata("design:type", String)
], FacebookAuthProfile.prototype, "accessToken", void 0);
exports.FacebookAuthProfile = FacebookAuthProfile;
class authProfileData {
}
__decorate([
    (0, class_transformer_1.Expose)({ name: 'id_token', groups: ['private'] }),
    __metadata("design:type", String)
], authProfileData.prototype, "jwtToken", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'access_token', groups: ['private'] }),
    __metadata("design:type", String)
], authProfileData.prototype, "accessToken", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'refresh_token', groups: ['private'] }),
    __metadata("design:type", String)
], authProfileData.prototype, "refreshToken", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['private'] }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], authProfileData.prototype, "expiry", void 0);
exports.authProfileData = authProfileData;
class UserProfile {
    constructor(email, createdOn, lastLogin, name, surname, profilePicture, uid, locale, jwtToken, accessToken, refreshToken) {
        this.uid = uid;
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.profilePicture = profilePicture;
        this.locale = locale;
        this.createdOn = createdOn ? createdOn : new Date();
        this.lastLogin = lastLogin ? lastLogin : new Date();
    }
    static init(authProfile, uid, createdOn, lastLogin) {
        return new UserProfile(authProfile.email, new Date(), new Date(), authProfile.name, authProfile.surname, authProfile.profilePicture, uid, authProfile.locale, authProfile.jwtToken, authProfile.accessToken, authProfile.refreshToken);
    }
    static async createUserProfile(authProfile, uid) {
        const connection = await database_1.DBClient.connect();
        const collection = connection.db('TulacikoviaUserData').collection('userProfiles');
        try {
            const completeProfile = UserProfile.init(authProfile);
            const dbProfile = (0, class_transformer_1.instanceToInstance)(completeProfile, { groups: ['database_preservable'], excludeExtraneousValues: true, exposeUnsetFields: false });
            Object.keys(dbProfile).forEach((k) => !dbProfile[k] && delete dbProfile[k]);
            const dbUser = await collection.insertOne(dbProfile);
            completeProfile.uid = dbUser.insertedId;
            const userProfile = (0, class_transformer_1.instanceToInstance)(completeProfile, { groups: ['private'] });
            return userProfile;
        }
        catch (error) {
            console.error("Register new user error: ", error);
            throw error;
        }
        finally {
            await connection.close();
        }
    }
    static async initFromDB(authProfile) {
        const connection = await database_1.DBClient.connect();
        try {
            const collection = connection.db('TulacikoviaUserData').collection('userProfiles');
            const userData = await collection.findOne({ email: authProfile.email });
            var userProfile = (0, class_transformer_1.plainToInstance)(UserProfile, userData, { groups: ['private'] });
            if (userProfile != null)
                return userProfile;
        }
        catch (error) {
            console.error("Database error:", error);
            return undefined;
        }
        finally {
            await connection.close();
        }
    }
}
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['internal', 'private', 'public', 'database_preservable'] }),
    (0, class_transformer_1.Transform)(({ obj, key }) => (obj['_id'] != null) ? new mongodb_1.ObjectId(obj['_id']) : undefined),
    __metadata("design:type", mongodb_1.ObjectId)
], UserProfile.prototype, "uid", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['internal', 'private', 'public', 'database_preservable'] }),
    __metadata("design:type", String)
], UserProfile.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['internal', 'private', 'public', 'database_preservable'] }),
    __metadata("design:type", String)
], UserProfile.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['internal', 'private', 'public', 'database_preservable'] }),
    __metadata("design:type", String)
], UserProfile.prototype, "surname", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['internal', 'private', 'public', 'database_preservable'] }),
    __metadata("design:type", String)
], UserProfile.prototype, "profilePicture", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['internal', 'private', 'public', 'database_preservable'] }),
    __metadata("design:type", String)
], UserProfile.prototype, "locale", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['internal', 'private', 'public', 'database_preservable'] }),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UserProfile.prototype, "lastLogin", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['internal', 'private', 'public', 'database_preservable'] }),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UserProfile.prototype, "createdOn", void 0);
exports.UserProfile = UserProfile;
