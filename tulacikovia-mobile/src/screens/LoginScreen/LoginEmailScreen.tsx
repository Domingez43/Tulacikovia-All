import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, Text } from "react-native";
import ActionButton from "../../components/ActionButton";
import InputField from "../../components/InputField";
import React, { useState } from "react";
import { APIClient } from "../../apis/ServerRequests";
import { userStore } from "../../store/UserStore";
import { PlatformUser } from "../../models/UserProfile";
import { AuthInputComponent } from "../LoginScreen";
import { observer } from "mobx-react";
import { Toast } from "react-native-popup-confirm-toast";

//
// 1.1. Screen of flow, defines default login option
// Requires: Email & Password
//

interface LoginData {
    email: string;
    password: string;
}

export const LoginEmailScreenRoot = ({navigation}: any) => {
    const [loginData, setLoginData] = useState<LoginData>({ email: '', password: ''});
    const [messageShown, setMessageShow] = useState(false);

    function updateLoginDataObject(key: string, data: any) {
        loginData![key as keyof LoginData] = data
        setLoginData(loginData);
    }

    function showMessage(title: string, text: string, type: "SUCCESS" | "ERROR") {
        if(messageShown) return;

        Toast.show({
            title: title,
            text: text,
            backgroundColor: (type == "SUCCESS") ? '#34c759' : '#ff3a30',
            timeColor: (type == "SUCCESS") ? '#16782e' : '#b02019',
            timing: 3000,
            position: 'top',
            statusBarType:'dark-content',
            onCloseComplete: () => { setMessageShow(false) },
            onOpenComplete: () => { setMessageShow(true) },
        })
    }

    return (
        <SafeAreaView>
            <AuthInputComponent 
                headerTitle="Haf, počul som správne?"
                subHeaderTitle="Prihlásenie"
                inputComponents={[
                    <InputField placeholder="meno@email.com" isPassword={false} value={loginData?.email} onEndEditing={(e) => { updateLoginDataObject('email', e.nativeEvent.text); }}/>,
                    <InputField placeholder="••••••••••" isPassword={true} value={loginData?.password} onEndEditing={(e) => { updateLoginDataObject('password', e.nativeEvent.text); }}/>
                ]}
                helpAction={
                    <TouchableOpacity onPress={() => { navigation.push('LoginProblemScreen')}} style={{alignSelf: 'flex-end', marginBottom: 15}}>
                        <Text style={{ margin: 25, marginBottom: 0, marginTop: 15, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                    </TouchableOpacity>
                }
                submitAction={ <ActionButton action={async () => { 
                    var authRequest = await APIClient.bffRequest('login', { method: 'POST', data: loginData});

                    var profileRequest = await APIClient.bffRequest('registration/profile', { method: 'GET'}, authRequest.data.token);

                    if(profileRequest.status != 200) {
                        showMessage('Prihlásenie sa nepodarilo!', 'Skontroluj prihlásovacie údaje alebo pokračuj v sekcii "Problém s prihlásením".\n', 'ERROR');
                        return;
                    }

                    userStore.setUser(profileRequest.data as PlatformUser)
                    userStore.setToken(authRequest.data.token);

                }} title={'Prihlásiť'} color={'#80B3FF'} orientation="center"/> }
                subAction={
                    <TouchableOpacity onPress={() => { navigation.push('Auth.UserType')}} >
                        <Text style={{ margin: 25, marginBottom: 0, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Chcem si vytvoriť účet!</Text>
                    </TouchableOpacity>
                }
            />
        </SafeAreaView>
    )
}

export const LoginEmailScreen = observer(LoginEmailScreenRoot);