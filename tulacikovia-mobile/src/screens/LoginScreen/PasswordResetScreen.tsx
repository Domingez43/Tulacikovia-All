import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import InputField from '../../components/InputField';
import ActionButton from '../../components/ActionButton';
import InputDialog from '../InputDialog/InputDialog';
import { Toast } from 'react-native-popup-confirm-toast';
import { APIClient } from "../../apis/ServerRequests";

export const PasswordResetScreen = ({navigation}: any) => {
    
    const [email, setEmail] = useState('')
    const [messageShown, setMessageShow] = useState(false);
    
    function showMessage(title: string, text: string, type: "SUCCESS" | "ERROR") {
        console.log('About to show message.')
        if(messageShown) return;
        Toast.show({
            title: title,
            text: text + "\n",
            backgroundColor: (type == "SUCCESS") ? '#34c759' : '#ff3a30',
            timeColor: (type == "SUCCESS") ? '#16782e' : '#b02019',
            timing: 3000,
            position: 'top',
            statusBarType:'dark-content',
            onCloseComplete: () => { setMessageShow(false) },
            onOpenComplete: () => { setMessageShow(true) },
        })    
    }
    function updateEmail(key: string, data: any) {
        setEmail(data);
    }

    return (
        <SafeAreaView>
           <InputDialog.DataInput
            title='Zabudol si svoje heslo?'
            text='Zadajte svoj e-mail na ktorý vám vieme zaslať link pre resetovanie hesla .'
            inputComponents={[
                <InputField key={'email'} value={email} style={{margin: 0}} placeholder='E-mail' onChange={(e) => { updateEmail('email', e.nativeEvent.text); }} />
            ]}
            submitAction={ <ActionButton action={() => {
                    if(email=='') showMessage('Nezadal si e-mail!', 'Prosím, zadaj svoj e-mail.', 'ERROR'); 
                    else{
                    APIClient.bffRequest('sendResetMail', { method: 'POST', data: { email: email } }).then((res) => { 
                        console.log(JSON.stringify(res.data));
                        if(res.data.message === "Email sent.") showMessage('E-mail sa našiel.', 'Na e-mail, ktorý si zadal, sme ti poslali odkaz na obnovenie hesla.\n', 'SUCCESS'), navigation.push('PasswordResetSuccess'); 
                        else showMessage('Zadal si nesprávny e-mail.', 'Prosím, skús e-mail zadať ešte raz.\n', 'ERROR'); 
                    }) 
                 }}} title={'Poslať'} color={'#80B3FF'} orientation="center" returnAction={() => { navigation.goBack(); }} returnTitle="Späť"/>
                
            }
            closeHandler={() => navigation.goBack()} 
            header='Reset hesla'
          />
        </SafeAreaView>
    )
}
