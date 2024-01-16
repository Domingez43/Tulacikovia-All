import { Expose } from "class-transformer";
import { APIClient } from "../apis/ServerRequests";
import { userStore } from "../store/UserStore";

export enum AppealFilterFields {
    startDate = 'startDate',
    endDate = 'endDate',
    createdOn = 'createdOn',
    organisator = 'organisatorID',
    location = 'location',
    type = 'type',
    id = '_id'
}

export interface DBFilterOptions<T = AppealFilterFields> {
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
    EXCLUDE = 'exclude',
    CONTENT_TYPE = 'content_type',
}

export interface AppealModel {
    id: string;
    name: string;
    description: string;
    images: string[];
    organisatorID?: string;
    tags: string[];
    type: AppealType;
    contentType: AppealContentType;
    draft: boolean;
    archived?: boolean;
    insert(): Promise<this>;
    update(): Promise<this>;
    createdOn: Date;
    location: LocationModel;
}

export enum AppealType {
    APPEAL = "APPEAL", EVENT = "EVENT", UNKNOWN = "UNKNOWN"
}

export enum AppealContentType {
    REGULAR = "REGULAR", WALK = "WALK", DONATION = "DONATION", ADOPTION = "ADOPTION"
}

export class Appeal implements AppealModel {
    id: string;
    name: string;
    description: string;
    images: string[];
    organisatorID?: string | undefined;
    tags: string[];
    type: AppealType = AppealType.APPEAL;
    contentType: AppealContentType = AppealContentType.REGULAR;
    draft: boolean;
    archived?: boolean;
    createdOn: Date;
    location: LocationModel;


    constructor(name: string, description: string, tags: string[], images: any[], draft: boolean, location: LocationModel, id?: string, organisatorID?: string, archived?: boolean, createdOn?: Date) {
        this.id = id ?? this.generateId();
        this.name = name;
        this.description = description;
        this.tags = tags;
        this.images = images;
        this.organisatorID = organisatorID;
        this.draft = draft;
        this.archived = archived;
        this.createdOn = createdOn ?? new Date();
        this.location = location;
    }

    private generateId = function (specialChars = true, length = 10, avoidChars = '') {
        let _pattern = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        _pattern += specialChars === true ? '(){}[]+-*/=' : '';
        if (avoidChars && avoidChars.length) {
            for (let char of avoidChars) {
                _pattern = _pattern.replace(char, '');
            }
        }
        let _random = '';
        for (let element of new Array(length)) {
            _random += _pattern.charAt(Math.floor(Math.random() * _pattern.length));
        }
        return _random;
    };

    transform<T>(): T | undefined {
        return (this as unknown as T) ? this as unknown as T : undefined;
    }

    async uploadImages() {

        var _images = [];
        for(var image of this.images) {
            var { exists } = await APIClient.getImageInfo(image, userStore.token);
            if (!exists) _images.push(await APIClient.uploadImage(image));
        }
        
        this.images = [...this.images.filter(image => !APIClient.isLocalUri(image)), ..._images];
        return this;
    }

    async update(uploadImages: boolean = false): Promise<this> {
        console.log('Updating content with image upload: ' + uploadImages);
        var result = (uploadImages) ? await this.uploadImages() : this;
        var response = await APIClient.apiRequest('content/update/appeal', {method: 'POST', data: result}, userStore.token);
        console.log('Called update endpoint: ' + 'content/update/appeal' + ', with result: ' + JSON.stringify(response));
        return result;
    }

    async delete(): Promise<boolean> {
        var response = await APIClient.apiRequest('/content/appeals/delete', {method: 'POST', data: this}, userStore.token);
        console.log('Called delete endpoint: ' + '/content/appeals/delete' + ', with result: ' + JSON.stringify(response));
        return response.status == 200;
    }

    async insert(): Promise<this> {
        console.log('Inserting content with image upload: ');
       var result = await this.uploadImages();
       var response = await APIClient.apiRequest('content/create/appeal', {method: 'POST', data: result}, userStore.token);
       result.id = response.data.objectId;
       console.log('Called insert endpoint: ' + 'content/create/appeal' + ', with result: ' + JSON.stringify(response));
       return result;
    };

    imageUploadRequired() { 
        for(var image of this.images) {
            console.log('Checking: ' + image + ', with result: ' + APIClient.isLocalUri(image));
            if(APIClient.isLocalUri(image)) return true;
        }
        return false;
    }

    static async getList<T>(filtersToApply: AppealFilters[], filterConfig: DBFilterOptions, token?: string, startOnIndex?: number, params?: any[]) {
        var endpoint = APIClient.buildEnpointWithQuery('content/list/appeals', {
            applyFilters: filtersToApply.join(','),
            params: params?.join(','),
            lastIndex: startOnIndex,
            sort: filterConfig.sort,
            limit: filterConfig.limit,
            sortBy: filterConfig.sortBy
        });
        console.log(endpoint);
        var result = await APIClient.apiRequest(endpoint, { method: 'GET' }, token);
        return result.data.list as T[];
    }

    async participate() {
        var query = APIClient.buildEnpointWithQuery('content/appeals/participate', { appeal: this.id})
        var result = await APIClient.apiRequest<{participated: boolean}>(query, { method: 'POST'}, userStore.token);
        return result.status == 200;
    }

    async unparticipate() {
        var query = APIClient.buildEnpointWithQuery('content/appeals/unparticipate', { appeal: this.id })
        var result = await APIClient.apiRequest<{participated: boolean}>(query, { method: 'POST'}, userStore.token);
        return result.status == 200;
    }

    static init({name, description, tags, images, location, draft, organisatorID, id}: AppealModel): Appeal {
        console.log('Initializating with [id, draftState] ' + [id, draft])
        return new Appeal(name, description, tags, images, draft, location, id, organisatorID);
    }

}

export class LocationModel {
    type: string = "Point";
    address!: string;
    coordinates!: [number, number] // longitude, latitude
}

export interface EventModel extends AppealModel {
    startDate: Date;
    endDate: Date;
}

export class Event extends Appeal implements EventModel {
    startDate: Date;
    endDate: Date;
    location: LocationModel;
    type: AppealType = AppealType.EVENT;

    constructor(name: string, description: string, startDate: Date, endDate: Date, tags: string[], images: any[], location: LocationModel, draft: boolean, organisatorID?: string, id?: string, archived?: boolean) {
        super(name, description, tags, images, draft, location, id, organisatorID, archived);
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
    }
    
    
    static init({name, description, startDate, endDate, tags, images, location, draft, organisatorID, id}: EventModel): Event {
        console.log('Initializating with [id, draftState] ' + [id, draft])
        return new Event(name, description, startDate, endDate, tags, images, location, draft, organisatorID, id);
    }
    
}