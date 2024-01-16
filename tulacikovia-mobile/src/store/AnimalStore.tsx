import { makeAutoObservable } from 'mobx'
import { Animal, AnimalModel } from '../models/AnimalModel';

export class AnimalStore {
    animals?: Map<string, AnimalModel> = undefined;
    
    constructor(){ makeAutoObservable(this); }

    publish(object: Animal, insert: boolean = false) {
        if(this.animals == undefined) this.animals = new Map<string, AnimalModel>();

        if(insert) {
            object.insert().then(animal => animalStore.setObject(animal));
        } else {
            object.update(object.imageUploadRequired()).then(animal => animalStore.setObject(animal));
        }
    }

    setObject(object: Animal) {
        if(this.animals == undefined) this.animals = new Map<string, AnimalModel>();
        this.animals!.set(object.id, object);
    }

    setObjects(objects: Animal[]) {
        if(this.animals == undefined) this.animals = new Map<string, AnimalModel>();
        objects.forEach(acq => this.animals!.set(acq.id, acq));
    }

    refreshWithData(objects: Animal[]) {
        this.animals = new Map<string, AnimalModel>();
        objects.forEach(acq => this.animals!.set(acq.id, acq));
    }

    addObjects(objects: Animal[]) {
        if(this.animals == undefined) this.animals = new Map<string, AnimalModel>();
        objects.forEach(acq => this.animals!.set(acq.id, acq));
    }

    removeObject(object: Animal) {
        if(this.animals == undefined) return;
        this.animals.delete(object.id);
    }
}

export const animalStore = new AnimalStore();