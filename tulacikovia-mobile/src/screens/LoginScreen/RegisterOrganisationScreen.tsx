import { SafeAreaView } from "react-native-safe-area-context";
import { View, TouchableOpacity, Text } from "react-native";
import ActionButton from "../../components/ActionButton";
import InputField from "../../components/InputField";
import React, { useState } from "react";
import { ScreenFlow } from "../../components/ScreenFlow";



import { userStore } from "../../store/UserStore";
import { AuthProfile, OrgainzationType, OrganizationProfile } from "../../models/UserProfile";
import { AuthInputComponent } from "../LoginScreen";
import { APIClient } from "../../apis/ServerRequests";
import { observer } from "mobx-react";

//
// 1.x.2.1 Screen of flow, defines required data to register organisation
// Type: Registration
//

interface OrganisationRegistrationData {
    email: string;
    name: string;
    password: string;
    repeatedPassword: string;
    formalName: string;
    formalType: string;
    identificationNumber: string;
    bankContact: string;
}

const RegisterOrganisationScreenRoot = ({navigation, route}: any) => {
    const [screenIndex, setScreenIndex] = useState(0);
    const [registrationData, setRegistrationData] = useState<OrganisationRegistrationData>({ email: (userStore.authProfile?.email) ? userStore.authProfile.email : '', name: (userStore.authProfile?.name) ? userStore.authProfile.name : '', password: '', repeatedPassword: '', formalName: '', formalType: '', bankContact: '', identificationNumber: ''});
    const [messageShown, setMessageShow] = useState(false);

    const screensToSkip = () => (isSocialLogin()) ? [1] : undefined;
    function isSocialLogin(): boolean { return (route.params != undefined && route.params.socialLogin != undefined) ? route.params.socialLogin : false }

    function updateRegistrationObject(key: string, data: any) {
        registrationData![key as keyof OrganisationRegistrationData] = data
        setRegistrationData(registrationData);
    }

    async function registerAccount() {
        var registrationRequest = await APIClient.bffRequest('register', { method: 'POST', data: {
            email: registrationData.email,
            password: registrationData.password,
            repeatedPassword: registrationData.repeatedPassword
        }});
        var {token, status} = registrationRequest.data;

        if(status != 'REGISTERED') throw new Error('This account could not be registered.')

        var authRequest = await APIClient.bffRequest('registration/profile', { method: 'GET'}, token);
        userStore.setAuth(authRequest.data as AuthProfile)
        userStore.setToken(token);

        return token;
    }

    return (
        <SafeAreaView>
            <ScreenFlow index={screenIndex} skipIndexes={screensToSkip()}>
                <AuthInputComponent 
                    headerTitle="Haf, počul som správne?"
                    subHeaderTitle="Registrácia používateľa"
                    inputComponents={[
                        <InputField key={'email'} placeholder="kontakt@organizacia.com" value={registrationData?.email} isPassword={false} onEndEditing={(e) => { updateRegistrationObject('email', e.nativeEvent.text); }} enabled={(userStore.authProfile?.email) ? false : true} />,
                        <InputField key={'name'} placeholder="Názov profilu" value={registrationData?.name} isPassword={false} onEndEditing={(e) => { updateRegistrationObject('name', e.nativeEvent.text); }} />
                    ]}
                    helpAction={
                        <TouchableOpacity onPress={() => { navigation.push('LoginProblemScreen')}}  style={{alignSelf: 'flex-end', marginBottom: 15}}>
                            <Text style={{ margin: 25, marginBottom: 0, marginTop: 15, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                        </TouchableOpacity>
                    }
                    submitAction={ <ActionButton action={() => { setScreenIndex(screenIndex + 1) }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex((screenIndex - 1) >= 0 ? screenIndex - 1 : 0)}} returnTitle="Späť"/> }
                    subAction={ <Text style={{ margin: 25, marginTop: 15, marginBottom: 0, fontFamily: 'GreycliffCF-Regular', fontSize: 15, color: '#C2C2C2', textAlign: 'center'}}>Registráciou súhlasite s VOŠP a zbieraním osobných údajov GDPR aplikácie Tuláčikovia. </Text> }/>
                {!isSocialLogin() ? (
                    <AuthInputComponent 
                    headerTitle="Haf, počul som správne?"
                    subHeaderTitle="Registrácia používateľa"
                    inputComponents={[
                        <InputField placeholder="Zadaj nove heslo" isPassword={true} onEndEditing={(e) => { updateRegistrationObject('password', e.nativeEvent.text); }} enabled={true}/>,
                        <InputField placeholder="Zopaku nove heslo" isPassword={true} onEndEditing={(e) => { updateRegistrationObject('repeatedPassword', e.nativeEvent.text); }} enabled={true}/>
                    ]}
                    helpAction={
                        <TouchableOpacity onPress={() => { navigation.push('LoginProblemScreen')}} style={{alignSelf: 'flex-end', marginBottom: 15}}>
                            <Text style={{ margin: 25, marginBottom: 0, marginTop: 15, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                        </TouchableOpacity>
                    }
                    submitAction={ <ActionButton action={() => { setScreenIndex(screenIndex + 1) }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex((screenIndex - 1) >= 0 ? screenIndex - 1 : 0)}} returnTitle="Späť"/> }
                    subAction={ <Text style={{ margin: 25, marginTop: 15, marginBottom: 0, fontFamily: 'GreycliffCF-Regular', fontSize: 15, color: '#C2C2C2', textAlign: 'center'}}>Registráciou súhlasite s VOŠP a zbieraním osobných údajov GDPR aplikácie Tuláčikovia. </Text> } />
                ) : <View />}
                <AuthInputComponent 
                    headerTitle="Haf, počul som správne?"
                    subHeaderTitle="Registrácia používateľa"
                    inputComponents={[
                        <InputField key={'id'} placeholder="IČO Organizácie" value={registrationData?.identificationNumber} isPassword={false} onEndEditing={(e) => { updateRegistrationObject('identificationNumber', e.nativeEvent.text); }} enabled={true} />,
                        <InputField key={'address'} placeholder="Adresa Organizácie" value={registrationData?.bankContact} isPassword={false} onEndEditing={(e) => { updateRegistrationObject('bankContact', e.nativeEvent.text); }} enabled={true} />
                    ]}
                    helpAction={
                        <TouchableOpacity onPress={() => { navigation.push('LoginProblemScreen')}} style={{alignSelf: 'flex-end', marginBottom: 15}}>
                            <Text style={{ margin: 25, marginBottom: 0, marginTop: 15, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                        </TouchableOpacity>
                    }
                    submitAction={ <ActionButton action={() => { setScreenIndex(screenIndex + 1) }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex((screenIndex - 1) >= 0 ? screenIndex - 1 : 0)}} returnTitle="Späť"/> }
                    subAction={<Text style={{ margin: 25, marginTop: 15, marginBottom: 0, fontFamily: 'GreycliffCF-Regular', fontSize: 15, color: '#C2C2C2', textAlign: 'center'}}>Registráciou súhlasite s VOŠP a zbieraním osobných údajov GDPR aplikácie Tuláčikovia. </Text>}/>
                <AuthInputComponent 
                    headerTitle="Haf, počul som správne?"
                    subHeaderTitle="Registrácia používateľa"
                    inputComponents={[
                        <InputField key={'formalName'} placeholder="Formálny názov organizácie" value={registrationData?.formalName} isPassword={false} onEndEditing={(e) => { updateRegistrationObject('formalName', e.nativeEvent.text); }} enabled={true} />,
                        <InputField key={'formalType'} placeholder="Občianske združenie" value={registrationData?.formalType} isPassword={false} onEndEditing={(e) => { updateRegistrationObject('formalType', e.nativeEvent.text); }} enabled={true} />
                    ]}
                    helpAction={
                        <TouchableOpacity onPress={() => { navigation.push('LoginProblemScreen')}} style={{alignSelf: 'flex-end', marginBottom: 15}}>
                            <Text style={{ margin: 25, marginBottom: 0, marginTop: 15, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                        </TouchableOpacity>
                    }
                    submitAction={ <ActionButton action={async () => { 
                        if(!isSocialLogin()) await registerAccount();
                        if(!userStore.authProfile || !userStore.token) {
                            console.log('ERROR: authProfile or token missing');
                            return;
                        }

                        console.log('Token before registration of the org: ' + userStore.token)

                        var orgProfile = await OrganizationProfile.createOrganisationProfile(userStore.authProfile);
                        orgProfile.bankContact = registrationData.bankContact;
                        orgProfile.identificationNumber = registrationData.identificationNumber;
                        orgProfile.formalName = registrationData.formalName;
                        orgProfile.formalType = OrgainzationType.NON_PROFIT;
                        orgProfile.name = registrationData.name;
                        var result = await orgProfile.finishRegistration(userStore.token, (isSocialLogin()) ? 'social' : 'email');

                        console.log('OrgRegistration: ' + JSON.stringify(result))

                        userStore.setUser(orgProfile);
                        userStore.state = result.status;
                        userStore.setToken(result.token);
                        
                    }} title={'Dokončiť'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex((screenIndex - 1) >= 0 ? screenIndex - 1 : 0)}} returnTitle="Späť"/> }
                    subAction={<Text style={{ margin: 25, marginTop: 15, marginBottom: 0, fontFamily: 'GreycliffCF-Regular', fontSize: 15, color: '#C2C2C2', textAlign: 'center'}}>Registráciou súhlasite s VOŠP a zbieraním osobných údajov GDPR aplikácie Tuláčikovia. </Text>}/>
            </ScreenFlow>
            
        </SafeAreaView>
    )
}

export const RegisterOrganisationScreen = observer(RegisterOrganisationScreenRoot)