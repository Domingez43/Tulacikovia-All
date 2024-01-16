import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, Text } from "react-native";
import ActionButton from "../../components/ActionButton";
import React from "react";
import { APIClient } from "../../apis/ServerRequests";
import { observer } from 'mobx-react';

import * as queryString from 'query-string';


import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from "expo-auth-session";
import { userStore } from "../../store/UserStore";
import { AuthProfile, PlatformUser } from "../../models/UserProfile";
import { AuthPickerComponent } from "../LoginScreen";

//
// 1.2. Screen of flow, defines what social provider will use to login
// Options: Google OR Facebook
//

const LoginSocialScreenRoot = ({navigation}: any) => {
    const YOUR_CLIENT_ID = "1075278479401-9hi0tuuvoe2v2o1rnl89so3bdoa8vvkd.apps.googleusercontent.com"
    const YOUR_REDIRECT_URI = "https://relyonproject.com/google";

    const handleGoogleLogin = async () => {

        var appURI = makeRedirectUri();
        var requestState = {
            appRedirect: appURI,
            stateStatus: 'AUTHENTICATING'
        }

        const stateParameter = `state@${requestState.stateStatus};appRedirect@${requestState.appRedirect}`

        const result: any = await WebBrowser.openAuthSessionAsync(
                `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${YOUR_CLIENT_ID}&redirect_uri=${YOUR_REDIRECT_URI}&scope=https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&access_type=offline&state=${stateParameter}&prompt=consent`,
                YOUR_REDIRECT_URI
        );  

        var regex = /[?&]([^=#]+)=([^&#]*)/g, params: any = {}, match;
        while (match = regex.exec(result.url)) params[match[1]] = match[2];
        
        userStore.state = params.state;

        switch(params.state) {
            case "LOGGEDIN":
                var authRequest = await APIClient.bffRequest('registration/profile', { method: 'GET'}, params.token);
                userStore.setUser(authRequest.data as PlatformUser)
                userStore.setToken(params.token);
                break;
            case "REGISTERED":
                var authRequest = await APIClient.bffRequest('registration/profile', { method: 'GET'}, params.token);
                userStore.setAuth(authRequest.data as AuthProfile)
                userStore.setToken(params.token);

                navigation.push('Auth.UserType', { socialLogin: true });
                break;
        }

    }

    const handleFacebookLogin = async () => {

        var appURI = makeRedirectUri();
        var requestState = {
            appRedirect: appURI,
            stateStatus: 'AUTHENTICATING'
        }

        const stateParameter = `state@${requestState.stateStatus};appRedirect@${requestState.appRedirect}`
        
        const stringifiedParams = queryString.default.stringify({
            client_id: '716472803273292',
            redirect_uri: 'https://relyonproject.com/facebook',
            scope: ['email', 'user_friends'].join(','), // comma seperated string
            response_type: 'code',
            auth_type: 'rerequest',
            display: 'popup',
            state: stateParameter,
        });

        const result: any = await WebBrowser.openAuthSessionAsync(
            `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`,
            'https://relyonproject.com/facebook'
        );  

        var regex = /[?&]([^=#]+)=([^&#]*)/g, params: any = {}, match;
        while (match = regex.exec(result.url)) params[match[1]] = match[2];

        userStore.state = params.state;
        
        switch(params.state) {
            case "LOGGEDIN":
                var authRequest = await APIClient.bffRequest('registration/profile', { method: 'GET'}, params.token);
                userStore.setUser(authRequest.data as PlatformUser)
                userStore.setToken(params.token);

                console.log(userStore.userProfile);
                break;
            case "REGISTERED":
                var authRequest = await APIClient.bffRequest('registration/profile', { method: 'GET'}, params.token);
                userStore.setAuth(authRequest.data as AuthProfile)

                userStore.setToken(params.token);
                navigation.push('Auth.UserType', { socialLogin: true });
                break;
        }
    }

    return (
        <SafeAreaView>
            <AuthPickerComponent 
                headerTitle="Haf, počul som správne?"
                subHeaderTitle="Chceš pomôcť ale nevieš ako?"
                paragraph="Vráť lásku tým ktorí to potrebujú zo všetkých najviac!"
                pickerActions={[
                    <ActionButton action={handleGoogleLogin} title={'Účet Google'} color={'#80B3FF'} style="OUTLINED" icons={[ require('../../../assets/google_icon.png') ]} />,
                    <ActionButton action={handleFacebookLogin} title={'Účet Facebook'} color={'#80B3FF'} style="OUTLINED" icons={[ require('../../../assets/fb_icon.png') ]}/>
                ]}
                subAction={
                    <TouchableOpacity onPress={() => { navigation.push('LoginProblemScreen')}}>
                        <Text style={{ margin: 25, marginBottom: 0, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                    </TouchableOpacity>
                }/>
        </SafeAreaView>
    )
}

export const LoginSocialScreen = observer(LoginSocialScreenRoot);