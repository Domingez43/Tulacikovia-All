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
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { TagsPillList } from '../../components/TagsPillList';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Appeal, AppealContentType, AppealModel, AppealType, Event, LocationModel } from '../../models/AppealModel';
import { Toast } from 'react-native-popup-confirm-toast';
import { appealStore } from '../../store/AppealStore';
import { observer } from 'mobx-react';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import { useActionSheet } from '@expo/react-native-action-sheet';
import {Picker} from '@react-native-picker/picker';


export const NewEventDialogRoot = ({navigation, route}: any) => {
    const [event, setEvent] = useStateWithCallbackLazy<Event>((route.params && route.params.Event) ? route.params.Event : new Event('', '', new Date(), new Date(), [], [], { address: '', coordinates: [1000, 1000], type: 'Point'}, true));
    const [screenIndex, setScreenIndex] = useState(0);
    const [numberOfScreens, setNumberOfScreens] = useState(0);
    const [messageShown, setMessageShow] = useState(false);

    const screenFlowRef = useRef<ScreenFlow>(null);
    const imageScrollRef = useRef<ScrollView>(null);

    const { showActionSheetWithOptions } = useActionSheet();
    
    var apiKey = 'AIzaSyDRpKzFzo2zsaP0_qUXAlJ2VQ8NMMArPzE';
    const contentType = ((route.params && route.params.type)) ? route.params.type : AppealType.EVENT;
    const headerTitle = (((route.params && route.params.Event)) ? 'Upraviť ' : 'Nová ') + getTypeTranslation(contentType);
    
    //
    // Effect handlers
    //

    useEffect(() => {
        if((route.params && route.params.Event)) console.log('Editing Event: ' + JSON.stringify(isEditing()))
    }, [event]);

    useEffect(() => {
        setScreenIndex((route.params && route.params.Event) ? screenFlowRef.current!.getNumberOfScreens() - 1 : 0);    
        setNumberOfScreens(screenFlowRef.current!.getNumberOfScreens());    
    },[])


    //
    // Action handlers
    //

    function isEditing(): boolean { 
        return route.params != undefined && route.params.Event != undefined;
    }

    function updateEvent(key: string, data: any) {

        // Set Data
        var _Event: Event = Event.init(event);
       (_Event![key as keyof Event] as any) = data;
        setEvent(_Event, (updated) => {
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
                  updateEvent('tags', event.tags.filter((_: any, i: number | undefined) => i !== index))
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
                        updateEvent('images', [...event.images, res]);
                    })
                    break;
                case 1:
                    // Delete
                    updateEvent('images', event.images.filter((_: any, i: number | undefined) => i !== index))
                    break;
            }
        }
        showActionSheetWithOptions({ options: ['Nahrať fotku', 'Odstrániť', 'Zrušiť'], destructiveButtonIndex: 1, cancelButtonIndex: 2, title: 'Označili ste fotku, chcete ju odstrániť alebo nahrať novú?'}, selectionAction);
    }

    const closeAlert = () => {
        const selectionAction = (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 0:
                    if(event.draft) {
                        console.log('Saving with state: ' + event.draft)
                        appealStore.saveDraft(event, !isEditing());
                    } else {
                        console.log('Saving with state: ' + event.draft)
                        appealStore.publishEvent(event);
                    }
                    navigation.goBack();
                    break;
                case 1:
                    navigation.goBack();
                    break;
            }
        }
        showActionSheetWithOptions({ options: ['Uložiť ' + getTypeTranslation(contentType), 'Zahodiť zmeny', 'Zrušiť'], destructiveButtonIndex: 1, cancelButtonIndex: 2, title: 'Údaje ktoré ste zadali do tejto udalosti neboli zatiaľ publikované, chcete tieto údaje uložiť do konceptu alebo zahodiť?'}, selectionAction);
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

    function getTypeTranslation(type: AppealType) {
        switch(type) {
            case AppealType.EVENT:
                return 'Udalosť';
            case AppealType.APPEAL:
                return 'Výzva'
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
        switch(contentType) {
            case AppealType.EVENT:
                if(!(areDatesValid() && isDescriptionValid() && isNameValid() && isLocationValid() && areImagesValid())) return;
                appealStore.publishEvent(event, !isEditing());
                showMessage('Udalosť ' + event.name + ', bola pridaná!', 'Ďakujeme za vytvorenie tejto udalosti pomocou platformy tuláčkovia!', "SUCCESS");
                break;
            case AppealType.APPEAL:
                if(!(isDescriptionValid() && isNameValid() && isLocationValid() && areImagesValid())) return;
                event.type = AppealType.APPEAL;
                appealStore.publishEvent(event as Appeal, !isEditing());
                showMessage('Výzva ' + event.name + ', bola pridaná!', 'Ďakujeme za vytvorenie tejto výzvy pomocou platformy tuláčkovia!', "SUCCESS");
                break;
        }
    }

    //
    // Validation functions
    //

    function areDatesValid() {
        if(event.startDate > event.endDate) {
            showMessage('Koniec udalosti je naplánovaný pred jej začiatkom!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím uprav počiatok alebo ukončenie udalosti tak aby sa '+getTypeTranslation(contentType)+' skončila po dátume začatia.', "ERROR");
            return false;
        } else if (event.endDate < new Date()) {
            showMessage('Koniec udalosti je naplánovaný pred aktuálnym dátumom!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím uprav ukončenie udalosti tak aby sa '+getTypeTranslation(contentType)+' skončila v dátume od dneška v budúcnosti.', "ERROR");
            return false;
        }

        return true;
    }

    function isNameValid() {
        if(event.name == undefined || event.name == '') { showMessage('Názov udalosti nie je vyplnený!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím vypĺňte jej stručný názov ktorý ju bude adekvátne vystihovať.', "ERROR"); return false; }
        if(event.name.length > 50) { showMessage('Názov udalosti príliš dlhý!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím vypĺňte jej stručný názov ktorý ju bude adekvátne vystihovať.', "ERROR"); return false; }
        return true;
    }

    function isDescriptionValid() {
        if(event.description == undefined || event.description == '') { showMessage('Popis udalosti nie je vyplnený!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím vypĺňte jej popis ktorý ju bude adekvátne vystihovať.', "ERROR"); return; }
        if(event.description.length < 50) { showMessage('Popis udalosti príliš krátky!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím vypĺňte jej rozsiahlejší popis ktorý ju bude adekvátne vystihovať.', "ERROR"); return false; }
        return true;
    }

    function isLocationValid() {
        if(event.location == undefined || event.location.address == '' || event.location.coordinates[1] == 1000 || event.location.coordinates[0] == 1000) { showMessage('Lokácie nie je vyplnená!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím zvoľte lokáciu kde sa táto '+getTypeTranslation(contentType)+' bude odohrávať.', "ERROR"); return false; }
        return true;
    }

    function areImagesValid() {
        if(!event.images || event.images.length == 0) { showMessage('Nebol zvolený žiaden obrázok!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím nahrajte aspoň jeden obrázok ktorý bude následne použitý ako nadhľad udalosti.', "ERROR"); return false; }
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
                    updateEvent('images', [...event.images, res]);
                })
            }} onLongPress={() => onLongPress(index)}>
                {image ? <Image style={{height: '100%', aspectRatio: 2}} source={{uri: image}} contentFit="cover" transition={200} /> : <Text style={{color: '#C2C2C2'}}>{text}</Text>} 
            </TouchableOpacity>
        )
    }

    const ProgressComponent = ({numberOfScreens, currentScreenIndex}: any) => {
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
            <ScreenFlow ref={screenFlowRef} index={screenIndex} style={{marginTop: insets!.top}} skipIndexes={getScreensIndexToSkip(contentType)}>
                <InputDialog.DataInput 
                    title={'Ako môžeme túto ' + getTypeTranslation(contentType)+' zaradiť?'}
                    text={'Vyberte jednu z možností ktorá najviac špecifikuje ' + getTypeTranslation(contentType) + ' ktorú sa chystáte vytvoriť.'}
                    inputComponents={[
                        <Picker selectedValue={event.contentType} onValueChange={(itemValue, itemIndex) => updateEvent('contentType', itemValue)} >
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
                    title={'Ako sa bude táto '+getTypeTranslation(contentType)+' volať?'}
                    text='Zadajte jednoduchý a krátky názov vašej udalosti ktorá ju vystihne v pár slovách.'
                    inputComponents={[
                        <InputField key={"Event.name"} value={event.name}  style={{margin: 0}} placeholder='názov udalosti' onEndEditing={(e: { nativeEvent: { text: any; }; }) => updateEvent('name', e.nativeEvent.text)}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(isNameValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => setScreenIndex(screenIndex - 1)} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='O čom táto udalosť bude?'
                    text='Zadajte rozsiahlejší popis plánovej udalosti. Popis by mal prilákať návštevníkov a ukázať o čom vaša udalosť bude.'
                    inputComponents={[
                        <InputField key={"Event.desc"} value={event.description} style={{margin: 0}} placeholder={"popis udalosti \n\n"} multiline={true} onEndEditing={(e: { nativeEvent: { text: any; }; }) => updateEvent('description', e.nativeEvent.text)}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(isDescriptionValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1);  }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Kde sa bude udalosť konať?'
                    text='Zadajte miesto kde sa táto udalosť bude konať. Lokácia je zvolená až po vybraní z dostupných možností.'
                    inputComponents={[
                        <GooglePlacesAutocomplete
                            placeholder={(event.location.address == '') ? 'Zadaj lokáciu' : event.location.address}
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
                            onFail={(error) => showMessage('Nastala chyba pri hľadaní lokácie!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím zvoľte inú lokáciu kde sa táto udalosť bude odohrávať.', "ERROR")}
                            onNotFound={() => showMessage('Takáto lokácia nebola nájdená!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím zvoľte inú lokáciu kde sa táto udalosť bude odohrávať.', "ERROR")}
                            onPress={(data, details = null) => {
                                if(details == null) {
                                    showMessage('Nastala chyba pri hľadaní lokácie!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím zvoľte inú lokáciu kde sa táto udalosť bude odohrávať.', "ERROR")
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
                            if(event.location.address == '') { showMessage('Lokácia udalosti nie je vyplnený!', 'Pre pokračovanie vo vytváraní tejto udalosti, prosím vypĺňte kde sa táto udalosť bude odohrávať.', "ERROR"); return; }
                            setScreenIndex(screenIndex + 1);
                        }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Kedy sa bude udalosť konať?'
                    text='Zadajte dátum a čas ktorý bude reprezentovať začiatok tejto udalosti. Používatelia budú o začiatku informovaný.'
                    inputStyle={{margin: 0, marginTop: 0}}
                    inputComponents={[
                        <RNDateTimePicker display="spinner" mode="datetime" value={new Date(event.startDate)} style={{flex: 1}} onChange={(event, _) => updateEvent('startDate', new Date(event.nativeEvent.timestamp!))}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Kedy sa táto udalosť skončí?'
                    text='Zadajte dátum a čas ktorý bude reprezentovať koniec tejto udalosti. Používatelia budú o začiatku informovaný.'
                    inputStyle={{margin: 0, marginTop: 0}}
                    inputComponents={[
                        <RNDateTimePicker display="spinner" mode="datetime" value={new Date(event.endDate)} style={{flex: 1}} onChange={(event, _) => updateEvent('endDate', new Date(event.nativeEvent.timestamp!))}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { 
                            if(areDatesValid()) setScreenIndex(screenIndex + 1);
                        }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Ako táto udalosť bude vyzerať?'
                    text='Nahrajte obrázkov ktoré ju môžu lepšie priblížiť, nahrajte ich kliknutím na plochu nižšie (alebo obrázok).'
                    inputStyle={{margin: 0}}
                    inputComponents={[
                        <ScrollView ref={imageScrollRef} horizontal={true} showsHorizontalScrollIndicator={false} pagingEnabled={true} contentContainerStyle={{flexDirection: 'row'}}>
                            <ImageContent text={'Nahrať obrázok'} margin={20} onLongPress={() => {}} />
                            {(event.images) ? event.images.map((image: any, index: any) => <ImageContent image={image} margin={20} index={index} onLongPress={deleteImageAlert} />) : <></>}
                        </ScrollView>,
                        <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15}}>
                            <Text style={{fontFamily: 'GreycliffCF-Medium', fontSize: 15, color: '#BDBDBD'}}>Nahrali ste {(event.images ?? []).length} {((event.images ?? []).length - 1 > 1) ? 'obrázky' : 'obrázok'} z maxima 10 obrázkov.</Text>
                        </View>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(areImagesValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Charakterizujte udalosť tagmi!'
                    text='Zadajte jednoduchý a krátky názov vašej udalosti ktorá ju vystihne v pár slovách.'
                    inputComponents={[
                        <InputField key={"Event.tags"} style={{margin: 0}} placeholder='názov tagu' onSubmit={(e: { nativeEvent: { text: any; }; }) => updateEvent('tags', [...event.tags, e.nativeEvent.text])}/>,
                        <TagsPillList tags={event.tags} tagColor='black' pillTextStyle={{fontSize: 16, margin: 3}} style={{marginTop: 10}} onLongPress={(tag: string, index: number | undefined) => { deleteTagAlert(tag, index) }}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => {
                            if(event.tags == undefined || event.tags.length == 0) event.tags = ['Udalosť', 'Pomoc', 'Dobrovoľníctvo', 'Adopcie']
                            showMessage('Udalosť je pripravená!', 'Udalosť obsahuje všetký potrebne dáta pre jej vytvorenie, ich pravdivosť overte a pokračujte vytvorením tejto udalosti!', "SUCCESS");
                            setScreenIndex(screenIndex + 1);
                         }} title={'Súhrn'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1) - getScreensIndexToSkip(contentType)!.length} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Finálny súhrn novej udalosti'
                    text='Skontrolujte údaje vyplnené v predošlých krokoch, v prípade nutnej zmeny je možné sa vrátiť späť. '
                    inputComponents={[
                        <TagsPillList tags={event.tags} tagColor='black' pillTextStyle={{fontSize: 16, margin: 3}} style={{marginTop: 3}} onLongPress={(tag: string, index: number | undefined) => { deleteTagAlert(tag, index) }}/>,
                        <ActionButton key={"Event.name.overview"} action={() => setScreenIndex(0)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={event.name} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Event.desc.overview"} action={() => setScreenIndex(1)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={event.description} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Event.location.overview"} action={() => setScreenIndex(2)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={event.location.address} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Event.startDate.overview"} action={() => setScreenIndex(3)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={(new Date(event.startDate)).toUTCString()} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Event.endDate.overview"} action={() => setScreenIndex(4)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={(new Date(event.endDate)).toUTCString()} color={'#EAEAEA'} orientation="flex-start"/>,
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

export const NewEventDialog = observer(NewEventDialogRoot);