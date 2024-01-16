import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { ScreenFlow } from '../../components/ScreenFlow';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import InputField from '../../components/InputField';
import ActionButton from '../../components/ActionButton';
import InputDialog from '../InputDialog/InputDialog';
import * as ImagePicker from 'expo-image-picker';
import { TagsPillList } from '../../components/TagsPillList';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Appeal, AppealContentType, AppealModel, AppealType, LocationModel } from '../../models/AppealModel';
import { Toast } from 'react-native-popup-confirm-toast';
import { appealStore } from '../../store/AppealStore';
import { observer } from 'mobx-react';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import { useActionSheet } from '@expo/react-native-action-sheet';
import {Picker} from '@react-native-picker/picker';


export const NewAppealDialogRoot = ({navigation, route}: any) => {
    const [appeal, setAppeal] = useStateWithCallbackLazy<Appeal>((route.params && route.params.appeal) ? route.params.appeal : new Appeal('', '', [], [], true, { address: '', coordinates: [0, 0], type: 'Point'}));
    const [screenIndex, setScreenIndex] = useState(0);
    const [numberOfScreens, setNumberOfScreens] = useState(0);
    const [messageShown, setMessageShow] = useState(false);

    const screenFlowRef = useRef<ScreenFlow>(null);
    const imageScrollRef = useRef<ScrollView>(null);

    const { showActionSheetWithOptions } = useActionSheet();
    
    var apiKey = 'AIzaSyDRpKzFzo2zsaP0_qUXAlJ2VQ8NMMArPzE';
    const contentType = ((route.params && route.params.type)) ? route.params.type : AppealType.APPEAL;
    const headerTitle = (((route.params && route.params.appeal)) ? 'Upraviť výzvu' : 'Nová výzva');
    
    //
    // Effect handlers
    //

    useEffect(() => {
        if((route.params && route.params.appeal)) console.log('Editing Appeal: ' + JSON.stringify(isEditing()))
    }, [appeal]);

    useEffect(() => {
        setScreenIndex((route.params && route.params.appeal) ? route.params.appeal.draft ? 0 : screenFlowRef.current!.getNumberOfScreens() - 1 : 0);    
        setNumberOfScreens(screenFlowRef.current!.getNumberOfScreens());    
    },[])


    //
    // Action handlers
    //

    function isEditing(): boolean { 
        return route.params != undefined && route.params.appeal != undefined;
    }

    function updateEvent(key: string, data: any) {

        // Set Data
        var _Event: Appeal = Appeal.init(appeal);
       (_Event![key as keyof Appeal] as any) = data;
        setAppeal(_Event, (updated) => {
            console.log('Updating object with key: ' + key)
            if(key == 'images') setTimeout(() => imageScrollRef.current?.scrollToEnd(), 0.1)
        });
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          quality: 1,
        });

        return (!result.canceled) ? result.assets.pop()!.uri : undefined;    
    };

    const deleteTagAlert = (tag: string, index?: number) => {
        const selectionAction = (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 1:
                  break;
                case 0:
                  // Delete
                  updateEvent('tags', appeal.tags.filter((_: any, i: number | undefined) => i !== index))
                  break;
            }
        }
        showActionSheetWithOptions({ options: ['Odstrániť', 'Zrušiť'], destructiveButtonIndex: 0, cancelButtonIndex: 1, title: 'Naozaj chcete odstrániť tag "' + tag + '" z vášho listu?'}, selectionAction);
    }

    const deleteImageAlert = (index?: number) => {
        const selectionAction = (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 0:
                    pickImage().then(res => {
                        if(!res) return;
                        updateEvent('images', [...appeal.images, res]);
                    })
                    break;
                case 1:
                    // Delete
                    updateEvent('images', appeal.images.filter((_: any, i: number | undefined) => i !== index))
                    break;
            }
        }
        showActionSheetWithOptions({ options: ['Nahrať fotku', 'Odstrániť', 'Zrušiť'], destructiveButtonIndex: 1, cancelButtonIndex: 2, title: 'Označili ste fotku, chcete ju odstrániť alebo nahrať novú?'}, selectionAction);
    }

    const closeAlert = () => {
        const selectionAction = (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 0:
                    if(appeal.draft) {
                        console.log('Saving with state: ' + appeal.draft)
                        appealStore.saveDraft(appeal, !isEditing());
                    } else {
                        console.log('Saving with state: ' + appeal.draft)
                        appealStore.publishEvent(appeal);
                    }
                    navigation.goBack();
                    break;
                case 1:
                    navigation.goBack();
                    break;
            }
        }
        showActionSheetWithOptions({ options: ['Uložiť výzvu', 'Zahodiť zmeny', 'Zrušiť'], destructiveButtonIndex: 1, cancelButtonIndex: 2, title: 'Údaje ktoré ste zadali do tejto výzvy neboli zatiaľ publikované, chcete tieto údaje uložiť do konceptu alebo zahodiť?'}, selectionAction);
    }
    
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

    function getScreensIndexToSkip(type: AppealType) {
        switch(type) {
            case AppealType.EVENT:
                return [];
            case AppealType.APPEAL:
                return [4];
        }
    }

    function getContentTypeTranslation(type: AppealContentType) {
        switch(type) {
            case AppealContentType.ADOPTION:
                return 'Adopcie';
            case AppealContentType.WALK:
                return 'Prechádzky'
            case AppealContentType.REGULAR:
                return 'Nezaradené';
            case AppealContentType.DONATION:
                return 'Zbierky';
        }
    }

    function publishContent() {
        if(!(isDescriptionValid() && isNameValid() && isLocationValid() && areImagesValid())) return;
        appeal.type = AppealType.APPEAL;
        appealStore.publishEvent(appeal as Appeal, !isEditing());
        showMessage('Výzva ' + appeal.name + ', bola pridaná!', 'Ďakujeme za vytvorenie tejto výzvy pomocou platformy tuláčkovia!', "SUCCESS");
    }

    //
    // Validation functions
    //

    function isNameValid() {
        if(appeal.name == undefined || appeal.name == '') { showMessage('Názov výzvy nie je vyplnený!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím vypĺňte jej stručný názov ktorý ju bude adekvátne vystihovať.', "ERROR"); return false; }
        if(appeal.name.length > 50) { showMessage('Názov výzvy príliš dlhý!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím vypĺňte jej stručný názov ktorý ju bude adekvátne vystihovať.', "ERROR"); return false; }
        return true;
    }

    function isDescriptionValid() {
        if(appeal.description == undefined || appeal.description == '') { showMessage('Popis výzvy nie je vyplnený!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím vypĺňte jej popis ktorý ju bude adekvátne vystihovať.', "ERROR"); return; }
        if(appeal.description.length < 50) { showMessage('Popis výzvy príliš krátky!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím vypĺňte jej rozsiahlejší popis ktorý ju bude adekvátne vystihovať.', "ERROR"); return false; }
        return true;
    }

    function isLocationValid() {
        if(appeal.location == undefined || appeal.location.address == '' || appeal.location.coordinates[1] == 1000 || appeal.location.coordinates[0] == 1000) { showMessage('Lokácie nie je vyplnená!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím zvoľte lokáciu kde sa táto výzva bude odohrávať.', "ERROR"); return false; }
        return true;
    }

    function areImagesValid() {
        if(!appeal.images || appeal.images.length == 0) { showMessage('Nebol zvolený žiaden obrázok!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím nahrajte aspoň jeden obrázok ktorý bude následne použitý ako nadhľad výzvy.', "ERROR"); return false; }
        return true;
    }

    //
    // Local Components
    //

    const ImageContent = ({image, margin, text, onLongPress, index}: any) => {
        return (
            <TouchableOpacity style={{backgroundColor: '#EAEAEA', width: Dimensions.get('screen').width - (margin * 2), height: Dimensions.get('window').height * 0.25, borderRadius: 25, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginLeft: 20, marginRight: 20}} onPress={() => {
                pickImage().then(res => {
                    if(!res) return;
                    updateEvent('images', [...appeal.images, res]);
                })
            }} onLongPress={() => onLongPress(index)}>
                {image ? <Image style={{height: '100%', aspectRatio: 2}} source={{uri: image}} contentFit="cover" transition={200} /> : <Text style={{color: '#C2C2C2'}}>{text}</Text>} 
            </TouchableOpacity>
        )
    }

    const ProgressComponent = ({currentScreenIndex}: any) => {
        const margin = 25; 
        return (
            <View style={{ width: Dimensions.get('window').width - (margin * 2), height: 8, flexDirection: 'row', gap: 10, padding: 1, marginLeft: margin, marginRight: margin, marginTop: 20}}>
                {[...Array(numberOfScreens <= 0 ? 1 : numberOfScreens)].map((_, i) => <View style={{ flexGrow: 1, backgroundColor: (i <= currentScreenIndex) ? '#80B3FF' : '#EAEAEA', borderRadius: 20}}/>)}
            </View>
        )
    }

    //
    // Main Component
    //

    return (
        <SafeAreaInsetsContext.Consumer>
          {(insets) => (
            <ScreenFlow ref={screenFlowRef} index={screenIndex} style={{marginTop: insets!.top}}>
                <InputDialog.DataInput 
                    title={'Ako môžeme túto výzvu zaradiť?'}
                    text={'Vyberte jednu z možností ktorá najviac špecifikuje výzvu ktorú sa chystáte vytvoriť.'}
                    inputComponents={[
                        <Picker selectedValue={appeal.contentType} onValueChange={(itemValue, itemIndex) => updateEvent('contentType', itemValue)} >
                            {Object.entries(AppealContentType).map((val, index) => <Picker.Item label={getContentTypeTranslation(val[1])} value={val[1]} />)}
                        </Picker>
                    ]}
                    submitAction={
                        <ActionButton action={() => { setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => closeAlert()} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title={'Ako sa bude táto výzva volať?'}
                    text='Zadajte jednoduchý a krátky názov vašej výzvy ktorá ju vystihne v pár slovách.'
                    inputComponents={[
                        <InputField key={"Appeal.name"} value={appeal.name}  style={{margin: 0}} placeholder='názov výzvy' onEndEditing={(e: { nativeEvent: { text: any; }; }) => updateEvent('name', e.nativeEvent.text)}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(isNameValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => setScreenIndex(screenIndex - 1)} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Čo je cieľom tejto výzvy?'
                    text='Zadajte rozsiahlejší a cieľ vašej výzvy. Popis by mal ukázať čo a prečo je nutné vykonať pre splnenie tejto výzvy.'
                    inputComponents={[
                        <InputField key={"Appeal.desc"} value={appeal.description} style={{margin: 0}} placeholder={"popis výzvy \n\n"} multiline={true} onEndEditing={(e: { nativeEvent: { text: any; }; }) => updateEvent('description', e.nativeEvent.text)}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(isDescriptionValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1);  }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Aké miesto sa spája s touto výzvou?'
                    text='Zadajte miesto ktoré je spojené s vykonaním alebo organizáciou tejto výzvy. Môže to byť lokácia vášho útulku alebo iná.'
                    inputComponents={[
                        <GooglePlacesAutocomplete
                            placeholder={(appeal.location == undefined || appeal.location.address == '') ? 'Zadaj lokáciu' : appeal.location.address}
                            keepResultsAfterBlur={true}
                            styles={{
                                container: {
                                    flex: 0, 
                                },
                                textInputContainer: {
                                    backgroundColor: '#EAEAEA', padding: 13, paddingBottom: 12, paddingTop: 14, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignContent: 'center'
                                },
                                textInput: { fontFamily: 'GreycliffCF-Regular', fontSize: 18, backgroundColor: 'transparent' },
                            }}
                            onFail={(error) => showMessage('Nastala chyba pri hľadaní lokácie!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím zvoľte inú lokáciu.', "ERROR")}
                            onNotFound={() => showMessage('Takáto lokácia nebola nájdená!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím zvoľte inú lokáciu.', "ERROR")}
                            onPress={(data, details = null) => {
                                if(details == null) {
                                    showMessage('Nastala chyba pri hľadaní lokácie!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím zvoľte inú lokáciu.', "ERROR")
                                    return;
                                }
                                var location: LocationModel = { address: data.description, coordinates: [details.geometry.location.lng, details.geometry.location.lat], type: 'Point'};
                                updateEvent('location', location);
                            }}
                            listViewDisplayed={true}
                            fetchDetails={true}
                            query={{ key: apiKey, language: "sk"}} />
                    ]}
                    submitAction={
                        <ActionButton action={() => { 
                            if(appeal.location.address == '') { showMessage('Lokácia výzvy nie je vyplnená!', 'Pre pokračovanie vo vytváraní tejto výzvy, prosím vypĺňte lokáciu pre túto výzvu.', "ERROR"); return; }
                            setScreenIndex(screenIndex + 1);
                        }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Pridajte nadhľad pre výzvu!'
                    text='Nahrajte niekoľko obrázkov ktoré ju môžu lepšie priblížiť, nahrajte ich kliknutím na plochu nižšie (alebo obrázok).'
                    inputStyle={{margin: 0}}
                    inputComponents={[
                        <ScrollView ref={imageScrollRef} horizontal={true} showsHorizontalScrollIndicator={false} pagingEnabled={true} contentContainerStyle={{flexDirection: 'row'}}>
                            <ImageContent text={'Nahrať obrázok'} margin={20} onLongPress={() => {}} />
                            {(appeal.images) ? appeal.images.map((image: any, index: any) => <ImageContent image={image} margin={20} index={index} onLongPress={deleteImageAlert} />) : <></>}
                        </ScrollView>,
                        <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15}}>
                            <Text style={{fontFamily: 'GreycliffCF-Medium', fontSize: 15, color: '#BDBDBD'}}>Nahrali ste {(appeal.images ?? []).length} {((appeal.images ?? []).length - 1 > 1) ? 'obrázky' : 'obrázok'} z maxima 10 obrázkov.</Text>
                        </View>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(areImagesValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Charakterizujte výzvu tagmi!'
                    text='Zadajte jednoduchý a krátky názov vašej výzvy ktorá ju vystihne v pár slovách.'
                    inputComponents={[
                        <InputField key={"Appeal.tags"} style={{margin: 0}} placeholder='názov tagu' onSubmit={(e: { nativeEvent: { text: any; }; }) => updateEvent('tags', [...appeal.tags, e.nativeEvent.text])}/>,
                        <TagsPillList tags={appeal.tags} tagColor='black' pillTextStyle={{fontSize: 16, margin: 3}} style={{marginTop: 10}} onLongPress={(tag: string, index: number | undefined) => { deleteTagAlert(tag, index) }}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => {
                            if(appeal.tags == undefined || appeal.tags.length == 0) appeal.tags = ['Výzva', 'Pomoc', 'Dobrovoľníctvo', 'Adopcie']
                            showMessage('Výzva je pripravená!', 'Výzva obsahuje všetký potrebne dáta pre jej vytvorenie, ich pravdivosť overte a pokračujte vytvorením tejto výzvy!', "SUCCESS");
                            setScreenIndex(screenIndex + 1);
                         }} title={'Súhrn'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Finálny súhrn novej výzvy'
                    text='Skontrolujte údaje vyplnené v predošlých krokoch, v prípade nutnej zmeny je možné sa vrátiť späť. '
                    inputComponents={[
                        <TagsPillList tags={appeal.tags} tagColor='black' pillTextStyle={{fontSize: 16, margin: 3}} style={{marginTop: 3}} onLongPress={(tag: string, index: number | undefined) => { deleteTagAlert(tag, index) }}/>,
                        <ActionButton key={"Appeal.name.overview"} action={() => setScreenIndex(0)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={appeal.name} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Appeal.desc.overview"} action={() => setScreenIndex(1)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={appeal.description} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Appeal.location.overview"} action={() => setScreenIndex(2)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={appeal.location == undefined ? '' : appeal.location.address} color={'#EAEAEA'} orientation="flex-start"/>,
                    ]}
                    submitAction={
                        <ActionButton action={() => { 
                            publishContent();
                            navigation.goBack();
                         }} title={'Publikovať'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
            </ScreenFlow>
          )}
        </SafeAreaInsetsContext.Consumer>
        
    )
}

export const NewAppealDialog = observer(NewAppealDialogRoot);