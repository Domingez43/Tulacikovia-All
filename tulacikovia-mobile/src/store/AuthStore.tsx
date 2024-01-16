import { makeAutoObservable, reaction } from 'mobx'
import axios from 'axios';
import { userStore } from './UserStore';

export class AuthStore implements UserAuth {
    uid: string = '';
    token?: string = undefined;
    refreshed: Date = new Date();

    constructor() {
        makeAutoObservable(this)
    }

    isLoggedIn() {
        console.log(userStore.state);
        console.log(userStore.token);
        return userStore.token != undefined && (userStore.state == "AUTHENTICATED" || userStore.state == "LOGGEDIN");
    }

    setToken(token: string) {
        this.token = token;
    }

    loginUser(email: String, password: String) {
        
        axios.get('http://88.212.54.66:3033/healthcheck')
        .then((response) => {
            this.setToken(response.data.status)
        })
        
    }
    
}

export const authDetails = new AuthStore();