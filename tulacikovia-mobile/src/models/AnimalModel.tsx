import { APIClient } from "../apis/ServerRequests";
import { userStore } from "../store/UserStore";
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
    NONE = '',
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
    id: string;
    name: string;
    description: string;
    gender: "MALE" | "FEMALE";
    type: AnimalSpieces;
    weight: number;
    birthDate: Date;
    color: string;
    adopted: boolean;
    owner: string;
    createdOn: Date;
    photos: string[];
    tags: string[];
    breed: string;
}

export class Animal implements AnimalModel {
    id: string;
    name: string;
    description: string;
    gender: "MALE" | "FEMALE";
    type: AnimalSpieces;
    weight: number;
    birthDate: Date;
    color: string;
    adopted: boolean;
    owner: string;
    createdOn: Date;
    photos: string[];
    tags: string[];
    breed: string;
    
    constructor(id: string, name: string, description: string, gender: "MALE" | "FEMALE", type: AnimalSpieces, weight: number, birthDate: Date, color: string, adopted: boolean, owner: string, createdOn: Date, photos: string[], tags: string[], breed: string) {
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

    static init({ id, name, description, gender, type, weight, birthDate, color, adopted, owner, createdOn, photos, tags, breed }: AnimalModel): Animal {
        console.log('Initializing Animal with [id, adopted] ' + [id, adopted]);
        return new Animal(id, name, description, gender, type, weight, birthDate, color, adopted, owner, createdOn, photos, tags, breed);
    }

    static getAnimalTypeTranslation(type: AnimalSpieces) {
        switch(type) {
            case AnimalSpieces.CAT:
                return 'Mačky';
            case AnimalSpieces.DOG:
                return 'Psíky'
            case AnimalSpieces.BIRD:
                return 'Vtáky';
            case AnimalSpieces.RODENT:
                return 'Hlodavce';
            case AnimalSpieces.FISH:
                return 'Ryby';
        }
    }

    static getGenderTranslation(gender: "MALE" | "FEMALE") {
        switch(gender) {
            case "MALE":
                return 'Samec';
            case "FEMALE":
                return 'Samica';
        }
    }

    static getAdoptionTranslation(state: 'ADOPTED' | 'NOT_ADOPTED') {
        switch(state) {
            case 'ADOPTED':
                return 'Už adoptovaný';
            case 'NOT_ADOPTED':
                return 'Dostupný k adopcií'
        }
    }

    static async getList<T>(filtersToApply: AnimalFilters[], filterConfig: DBFilterOptions<AnimalFilterFields>, token?: string, skip?: number, params?: any[]) {
        var endpoint = APIClient.buildEnpointWithQuery('content/animals/list', {
            applyFilters: filtersToApply.join(','),
            params: params?.join(','),
            skip: skip,
            sort: filterConfig.sort,
            limit: filterConfig.limit,
            sortBy: filterConfig.sortBy
        });
        console.log(endpoint);
        var result = await APIClient.apiRequest(endpoint, { method: 'GET' }, token);
        return result.data.list as T[];
    }

    async uploadImages() {
        var _images = [];
        for(var image of this.photos) {
            var { exists } = await APIClient.getImageInfo(image, userStore.token);
            if (!exists) _images.push(await APIClient.uploadImage(image));
        }
        
        this.photos = [...this.photos.filter(image => !APIClient.isLocalUri(image)), ..._images];
        return this;
    }

    async update(uploadImages: boolean = false): Promise<this> {
        console.log('Updating content with image upload: ' + uploadImages);
        var result = (uploadImages) ? await this.uploadImages() : this;
        var response = await APIClient.apiRequest('content/animals/update', {method: 'POST', data: result}, userStore.token);
        console.log(JSON.stringify(response));
        return result;
    }

    async insert(): Promise<this> {
        console.log('Inserting content with image upload: ');
       var result = await this.uploadImages();
       var response = await APIClient.apiRequest('content/animals/create', {method: 'POST', data: result}, userStore.token);
       result.id = response.data.objectId;
       return result;
    };

    imageUploadRequired() { 
        for(var image of this.photos) {
            console.log('Checking: ' + image + ', with result: ' + APIClient.isLocalUri(image));
            if(APIClient.isLocalUri(image)) return true;
        }
        return false;
    }

}