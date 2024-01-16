import { action, makeAutoObservable } from 'mobx'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makePersistable } from 'mobx-persist-store';
import { AuthProfile, OrganizationProfile, UserProfile } from '../models/UserProfile';

export interface UserStore {
    userProfile?: UserProfile | OrganizationProfile;
    authProfile?: AuthProfile;
    token?: string;
    state?: "UNKNOWN" | "REGISTERED" | "LOGGEDIN" | "AUTHENTICATED";
    location?: { latitude: number, longitude: number, city: string};
}

export class UserStore implements UserStore {
    userProfile?: UserProfile | OrganizationProfile = undefined;
    authProfile?: AuthProfile = undefined;
    token?: string = undefined;
    state?: "UNKNOWN" | "REGISTERED" | "LOGGEDIN" | "AUTHENTICATED" = "UNKNOWN";
    location?: { latitude: number, longitude: number, city: string} = undefined;
    
    constructor(){
        makeAutoObservable(this)
        makePersistable(this, { name: 'UserStore', properties: ['userProfile', 'authProfile', 'token', 'state'], storage: AsyncStorage}).then(action((persistStore) => {
            console.log('USERDATA: ' + JSON.stringify(this))
            console.log('[LOG]: UserPreferences store has been hydrated: ' + persistStore.isHydrated);
        }))
    }
    
    setToken(token?: string) {
        this.token = token;
    }

    setAuth(authProfile: AuthProfile) {
        this.authProfile = authProfile;
    }

    setUser(profile: UserProfile | OrganizationProfile) {
        this.userProfile = profile;
    }

    setLocation(location: { latitude: number, longitude: number, city: string}) {
        this.location = location;
    }

}

export const userStore = new UserStore();