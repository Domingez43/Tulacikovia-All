import { action, makeAutoObservable } from 'mobx'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makePersistable } from 'mobx-persist-store';
import { AuthProfile, OrganizationProfile, UserProfile } from '../models/UserProfile';
import { Event, AppealModel, EventModel, Appeal, AppealType } from '../models/AppealModel';
import { plainToInstance } from 'class-transformer';

export class AppealStore {
    appeals?: Map<string, AppealModel> = undefined;
    
    constructor(){
        makeAutoObservable(this);
        // makePersistable(this, { name: 'AppealStore', properties: ['appeals'], storage: AsyncStorage}).then(action(async (persistStore) => {
        //     var presStore = persistStore.getPersistedStore().then(store => {
        //         var data = store?.appeals; 
                
        //         if(!data) {
        //             console.log('Event data empty, returning...');
        //             return;
        //         }

        //         const appealMap = data.reduce((map: { set: (arg0: any, arg1: AppealModel) => void; }, item: [any, any]) => {
        //             const [key, value] = item;

        //             switch((value as Appeal).type) {
        //                 case AppealType.APPEAL:
        //                     map.set(key, plainToInstance(Appeal, value as unknown, { strategy: 'exposeAll' }));
        //                     break;
        //                 case AppealType.EVENT:
        //                     map.set(key, plainToInstance(Event, value as unknown, { strategy: 'exposeAll' }));
        //                     break;
        //                 default:
        //                     map.set(key, value as AppealModel);
        //             }
                    
        //             return map;
        //         }, new Map());

        //         this.appeals = appealMap;
                
        //     });
            

        //     console.log('Rehydrated appeal store: ' + JSON.stringify(this.appeals));
        //     console.log('[LOG]: Events store has been hydrated: ' + persistStore.isHydrated);
        // }))
    }

    publishEvent(event: Event | Appeal, insert: boolean = false) {
        if(this.appeals == undefined) this.appeals = new Map<string, AppealModel>();
        event.draft = false;
        console.log('About to insert: ' + JSON.stringify(event));
        if(insert) event.insert().then(event => appealStore.setEvent(event));
        else event.update(event.imageUploadRequired()).then(event => appealStore.setEvent(event));
    }

    setEvent(event: Event | Appeal) {
        if(this.appeals == undefined) this.appeals = new Map<string, AppealModel>();
        this.appeals!.set(event.id, event);
        console.log(JSON.stringify(this.appeals))
    }

    setEvents(events: Event[]) {
        if(this.appeals == undefined) this.appeals = new Map<string, AppealModel>();
        events.forEach(acq => this.appeals!.set(acq.id, acq));
        console.log(JSON.stringify(this.appeals))
    }

    refreshWithData(events: Event[]) {
        this.appeals = new Map<string, AppealModel>();
        events.forEach(acq => this.appeals!.set(acq.id, acq));
        console.log(JSON.stringify(this.appeals))
    }

    saveDraft(object: Event | Appeal, insert: boolean = false) {
        if(this.appeals == undefined) this.appeals = new Map<string, AppealModel>();
        object.draft = true;
        object.name = object.name == '' ? 'Koncept Udalosti' : object.name;
        object.tags = object.tags == undefined || object.tags.length == 0 ? ['Koncept', 'Udalost', 'Pomoc'] : object.tags;
        if(insert) object.insert().then(event => appealStore.setEvent(event));
        else object.update(object.imageUploadRequired()).then(event => appealStore.setEvent(event));
    }

    archiveEvent(event: Event) { 
        if(this.appeals == undefined) this.appeals = new Map<string, AppealModel>();
        event.archived = true;
        console.log('About to archive: ' + JSON.stringify(event));
        event.update().then(event => appealStore.setEvent(event));
    }

    addEvents(events: EventModel[]) {
        if(this.appeals == undefined) this.appeals = new Map<string, AppealModel>();
        events.forEach(acq => this.appeals!.set(acq.id, acq));
    }

    removeEvent(event: Event) {
        if(this.appeals == undefined) return;
        event.delete().then(res => {
            if(res) {
                console.log('Event deletion ' + (res) ? 'is successful.' : 'failed');
                this._deleteEvent(event);
            }
        })
    }

    _deleteEvent(event: Event) {
        if(this.appeals == undefined) return;
        this.appeals.delete(event.id);
    }
}

export const appealStore = new AppealStore();