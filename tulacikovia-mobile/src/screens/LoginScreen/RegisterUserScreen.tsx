import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, Text } from "react-native";
import ActionButton from "../../components/ActionButton";
import InputField from "../../components/InputField";
import React, { useState } from "react";
import { ScreenFlow } from "../../components/ScreenFlow";
import { Toast } from 'react-native-popup-confirm-toast'
import { APIClient } from "../../apis/ServerRequests";
import { userStore } from "../../store/UserStore";
import { AuthInputComponent } from "../LoginScreen";
import { AuthProfile, UserProfile } from "../../models/UserProfile";

//
// 1.x.1.1 Screen of flow, defines required data to register regular user
// Type: Registration
//

interface UserRegistrationData {
    email: string;
    name: string;
    password: string;
    repeatedPassword: string;
}

export const RegisterUserScreen = ({route}: any) => {

    // Constants 
    const [screenIndex, setScreenIndex] = useState(0);
    const [registrationData, setRegistrationData] = useState<UserRegistrationData>({ email: '', name: (userStore.authProfile?.name) ? userStore.authProfile.name : '', password: '', repeatedPassword: '' });
    const [messageShown, setMessageShow] = useState(false);
    const screensToSkip = (isSocialLogin()) ? [0] : [];
    
    // Functions
    function isSocialLogin(): boolean { return (route.params != undefined && route.params.socialLogin != undefined && route.params.socialLogin) ? route.params.socialLogin : false }

    function updateRegistrationObject(key: string, data: any) {
        registrationData![key as keyof UserRegistrationData] = data
        setRegistrationData(registrationData);
    }

    function showMessage(title: string, text: string, type: "SUCCESS" | "ERROR") {
        console.log('About to show message.')
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

    async function validateEmail(showAgree: boolean | undefined = false): Promise<boolean> {
        if(registrationData.email == '') {
            showMessage('Vyplň chýbajúce údaje!', 'Prosím vyplň všetky údaje ktoré sú vyžadované v poliach nižšie.\n', 'ERROR');
            return false;
        }

        var result = await APIClient.bffRequest('isEmailAvailable', {method: 'POST', data: { email: registrationData.email }});
        console.log(result.status)

        if(result.status !== 200) { 
            showMessage('Tento email sa už používa!', 'Prosím zvoľ inú emailovú adresu alebo ak si sa už zaregistroval, prihlás sa pomocou v sekcii prihlásenie.\n', 'ERROR');
        } else if(showAgree) {
            showMessage('Hurá, tento email je voľný!', 'Pokračuj v registrácii zadaním dodatočných údajov.\n', 'SUCCESS');
        }
        return result.status === 200;
    }


    function validateName(): boolean {
        if(registrationData.name == '') showMessage('Vyplň chýbajúce údaje!', 'Prosím vyplň všetky údaje ktoré sú vyžadované v poliach nižšie.\n', 'ERROR');
        return registrationData.name != '';
    }

    function validatePasswords(): boolean {
        if (registrationData.password != registrationData.repeatedPassword && registrationData.repeatedPassword != '') {
            showMessage('Heslá sa nezhodujú!', 'Pre kontrolu správnosti hesla musia byť obe heslá zadané v poliach zhodujúce.\n', 'ERROR');
            return false;
        } else if ((registrationData.password == '' && registrationData.repeatedPassword != '') || (registrationData.password != '' && registrationData.repeatedPassword == '')) {
            showMessage('Vyplň chýbajúce údaje!', 'Prosím vyplň všetky údaje ktoré sú vyžadované v poliach nižšie.\n', 'ERROR');
            return false;
        } else { 
            return (registrationData.password != '' && registrationData.repeatedPassword != ''); 
        }
    }

    async function registerAccount() {
        var registrationRequest = await APIClient.bffRequest('register', { method: 'POST', data: {
            email: registrationData.email,
            password: registrationData.password,
            repeatedPassword: registrationData.repeatedPassword
        }});
        var {token, status} = registrationRequest.data;

        if(status != 'REGISTERED') throw new Error('This account could not be registered. Response: ' + JSON.stringify(registrationRequest.data.error))

        var authRequest = await APIClient.bffRequest('registration/profile', { method: 'GET'}, token);
        userStore.setAuth(authRequest.data as AuthProfile)
        userStore.setToken(token);

        return true;
    }
        
    // Component
    return (
        <SafeAreaView>
            <ScreenFlow index={screenIndex} skipIndexes={screensToSkip}>
                <AuthInputComponent 
                    headerTitle="Haf!, počul som správne?"
                    subHeaderTitle="Registrácia používateľa"
                    inputComponents={[
                        <InputField key={'Auth.register.email'} placeholder="janko.hrasko@email.com" value={registrationData?.email} isPassword={false} onEndEditing={(e) => { updateRegistrationObject('email', e.nativeEvent.text); }} isInputValid={validateEmail as any}/>,
                        <InputField key={'Auth.register.name'} value={registrationData?.name} placeholder="Janko Hraško" isPassword={false} onEndEditing={(e) => { updateRegistrationObject('name', e.nativeEvent.text) }}/>
                    ]}
                    helpAction={
                        <TouchableOpacity style={{alignSelf: 'flex-end', marginBottom: 15}}>
                            <Text style={{ margin: 25, marginBottom: 0, marginTop: 15, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                        </TouchableOpacity>
                    }
                    submitAction={ <ActionButton action={() => { validateEmail(false).then(res => { if( res && validateName()) setScreenIndex(screenIndex + 1); }) }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex((screenIndex - 1) >= 0 ? screenIndex - 1 : 0)}} returnTitle="Späť"/> }
                    subAction={ <Text style={{ margin: 25, marginTop: 15, marginBottom: 0, fontFamily: 'GreycliffCF-Regular', fontSize: 15, color: '#C2C2C2', textAlign: 'center'}}>Registráciou súhlasite s VOŠP a zbieraním osobných údajov GDPR aplikácie Tuláčikovia. </Text> } />
                <AuthInputComponent 
                    headerTitle="Haf, počul som správne?"
                    subHeaderTitle="Registrácia používateľa"
                    inputComponents={[
                        <InputField key={'Auth.register.password'} value={registrationData?.password} placeholder="Zadaj nove heslo" isPassword={true}  onEndEditing={(e) => { updateRegistrationObject('password', e.nativeEvent.text); }} isInputValid={validatePasswords}/>,
                        <InputField key={'Auth.register.reppass'} value={registrationData?.repeatedPassword} placeholder="Zopakuj nove heslo" isPassword={true}  onEndEditing={(e) => { updateRegistrationObject('repeatedPassword', e.nativeEvent.text); }} isInputValid={validatePasswords}/>
                    ]}
                    helpAction={
                        <TouchableOpacity style={{alignSelf: 'flex-end', marginBottom: 15}}>
                            <Text style={{ margin: 25, marginBottom: 0, marginTop: 15, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                        </TouchableOpacity>
                    }
                    submitAction={ <ActionButton action={async () => { 
                        if(validatePasswords()) {
                            await registerAccount();
                            if(!userStore.authProfile || !userStore.token) {
                                console.log('ERROR: authProfile or token missing');
                                return;
                            }
                            
                            var userProfile = await UserProfile.createUserProfile(userStore.authProfile);
                            userProfile.name = registrationData.name;
                            var result = await userProfile.finishRegistration(userStore.token, isSocialLogin() ? 'social' : 'email');

                            userStore.setUser(userProfile);
                            userStore.state = result.status;
                            userStore.setToken(result.token);

                            if(result) showMessage('Hurá, tvoj účet bol vytvorený!', 'Teraz sa môžes kedykoľvek prihlásiť do tejto aplikácie.\n', 'SUCCESS'); 
                            else showMessage('Vyskytol sa problem s tvojou registráciou.', 'Nastal problém s registráciou konta pomocou zadaných údajov, registráciu skúste zopakovať neskôr.\n', 'ERROR'); 
                        }
                    }} title={'Dokončiť'} color={'#80B3FF'} orientation="center" returnAction={() => { 
                        setScreenIndex((screenIndex - 1) >= 0 ? screenIndex - 1 : 0)
                    }} returnTitle="Späť"/> }
                    subAction={ <Text style={{ margin: 25, marginTop: 15, marginBottom: 0, fontFamily: 'GreycliffCF-Regular', fontSize: 15, color: '#C2C2C2', textAlign: 'center'}}>Registráciou súhlasite s VOŠP a zbieraním osobných údajov GDPR aplikácie Tuláčikovia. </Text> } />
            </ScreenFlow>
        </SafeAreaView>
    )
}