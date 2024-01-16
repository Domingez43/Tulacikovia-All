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
import { Toast } from 'react-native-popup-confirm-toast';
import { appealStore } from '../../store/AppealStore';
import { observer } from 'mobx-react';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import { useActionSheet } from '@expo/react-native-action-sheet';
import {Picker} from '@react-native-picker/picker';
import { Animal, AnimalModel, AnimalSpieces } from '../../models/AnimalModel';
import { Notifications } from '../../utils/NotificationUtils';

const dummyAnimal: AnimalModel = {
    id: "",
    name: "",
    description: "",
    gender: "MALE",
    type: AnimalSpieces.DOG,
    weight: 0,
    birthDate: new Date(),
    color: "",
    adopted: false,
    owner: "",
    createdOn: new Date(),
    photos: [],
    tags: [],
    breed: ''
};

export const NewAnimalDialogRoot = ({navigation, route}: any) => {
    const [animal, setAnimal] = useStateWithCallbackLazy<Animal>((route.params && route.params.animal) ? route.params.animal : dummyAnimal);
    const [screenIndex, setScreenIndex] = useState(0);
    const [numberOfScreens, setNumberOfScreens] = useState(0);
    const [messageShown, setMessageShow] = useState(false);

    const screenFlowRef = useRef<ScreenFlow>(null);
    const imageScrollRef = useRef<ScrollView>(null);

    const { showActionSheetWithOptions } = useActionSheet();
    
    const headerTitle = 'Nové zvieratko';
    
    //
    // Effect handlers
    //

    useEffect(() => {
        if((route.params && route.params.animal)) console.log('Editing Animal: ' + JSON.stringify(isEditing()))
    }, [animal]);

    useEffect(() => {
        setScreenIndex((route.params && route.params.animal) ? screenFlowRef.current!.getNumberOfScreens() - 1 : 0);    
        setNumberOfScreens(screenFlowRef.current!.getNumberOfScreens());    
    },[])


    //
    // Action handlers
    //

    function isEditing(): boolean { 
        return route.params != undefined && route.params.animal != undefined;
    }

    function updateAnimal(key: string, data: any) {

        // Set Data
        var _Event: Animal = Animal.init(animal);
       (_Event![key as keyof Animal] as any) = data;
        setAnimal(_Event, (updated) => {
            console.log('Updating Animal object with key: ' + key)
            if(key == 'photos') setTimeout(() => imageScrollRef.current?.scrollToEnd(), 0.1)
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
                  updateAnimal('tags', animal.tags.filter((_, i) => i !== index))
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
                        updateAnimal('photos', [...animal.photos, res]);
                    })
                    break;
                case 1:
                    // Delete
                    updateAnimal('photos', animal.photos.filter((_, i) => i !== index))
                    break;
            }
        }
        showActionSheetWithOptions({ options: ['Nahrať fotku', 'Odstrániť', 'Zrušiť'], destructiveButtonIndex: 1, cancelButtonIndex: 2, title: 'Označili ste fotku, chcete ju odstrániť alebo nahrať novú?'}, selectionAction);
    }

    const closeAlert = () => {
        const selectionAction = (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 0:
                    navigation.goBack();
                    break;
                case 1:
                    break;
            }
        }
        showActionSheetWithOptions({ options: ['Zahodiť zmeny', 'Zrušiť'], destructiveButtonIndex: 0, cancelButtonIndex: 1, title: 'Údaje ktoré ste zadali do tohto profilu zvieratka zatiaľ neboli publikované, chcete pokračovať alebo tento profil zahodiť?'}, selectionAction);
    }

    function publishContent() {
        if(!(isDescriptionValid() && isNameValid() && areImagesValid())) return;

        if(!isEditing()) {
            animal.insert().then(animal => console.log('Created: ' + animal.id));
        } else {
            animal.update().then(animal => console.log('Updated: ' + animal.id));
        }

    }

    //
    // Validation functions
    //


    function isNameValid() {
        if(animal.name == undefined || animal.name == '') { Notifications.showMessage('Názov zvieratka nie je vyplnený!', 'Pre pokračovanie vo vytváraní tohto profilu, prosím vypĺňte jej stručný názov ktorý ju bude adekvátne vystihovať.', "ERROR"); return false; }
        if(animal.name.length > 50) { Notifications.showMessage('Názov zvieratka príliš dlhý!', 'Pre pokračovanie vo vytváraní tohto profilu, prosím vypĺňte jej stručný názov ktorý ju bude adekvátne vystihovať.', "ERROR"); return false; }
        return true;
    }

    function isDescriptionValid() {
        if(animal.description == undefined || animal.description == '') { Notifications.showMessage('Popis zvieratka nie je vyplnený!', 'Pre pokračovanie vo vytváraní tohto profilu, prosím vypĺňte jej popis ktorý ju bude adekvátne vystihovať.', "ERROR"); return; }
        if(animal.description.length < 50) { Notifications.showMessage('Popis zvieratka je príliš krátky!', 'Pre pokračovanie vo vytváraní tohto profilu, prosím vypĺňte jej rozsiahlejší popis ktorý ju bude adekvátne vystihovať.', "ERROR"); return false; }
        return true;
    }

    function areImagesValid() {
        if(!animal.photos || animal.photos.length == 0) { Notifications.showMessage('Nebol zvolený žiaden obrázok!', 'Pre pokračovanie vo vytváraní tohto profilu, prosím nahrajte aspoň jeden obrázok ktorý bude následne použitý ako nadhľad udalosti.', "ERROR"); return false; }
        return true;
    }

    function formatDate(date: Date) {
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();

        const dateString = `${day}. ${month}, ${year}`;
        return dateString;
    }

    //
    // Local Components
    //

    const ImageContent = ({image, margin, text, onLongPress, index}: any) => {
        return (
            <TouchableOpacity style={{backgroundColor: '#EAEAEA', width: Dimensions.get('screen').width - (margin * 2), height: Dimensions.get('window').height * 0.25, borderRadius: 25, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginLeft: 20, marginRight: 20}} onPress={() => {
                pickImage().then(res => {
                    if(!res) return;
                    updateAnimal('photos', [...animal.photos, res]);
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
            <ScreenFlow ref={screenFlowRef} index={screenIndex} style={{marginTop: insets!.top}}>
                <InputDialog.DataInput 
                    title={'Vyberte druh zvieratka ktorého pridávate.'}
                    text={'Vyberte jednu z možností ktorá najviac špecifikuje zvieratko ktoré sa chystáte pridať.'}
                    inputComponents={[
                        <Picker selectedValue={animal.type} onValueChange={(itemValue, itemIndex) => updateAnimal('type', itemValue)} >
                            {Object.entries(AnimalSpieces).map((val, index) => <Picker.Item label={Animal.getAnimalTypeTranslation(val[1])} value={val[1]} />)}
                        </Picker>
                    ]}
                    submitAction={
                        <ActionButton action={() => { setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => closeAlert()} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title={'Je to samček alebo samička?'}
                    text={'Vyberte jednu z možností ktorá najviac špecifikuje zvieratko ktoré sa chystáte pridať.'}
                    inputComponents={[
                        <Picker selectedValue={animal.gender} onValueChange={(itemValue, itemIndex) => updateAnimal('gender', itemValue)} >
                            {["MALE","FEMALE"].map((val, index) => <Picker.Item label={Animal.getGenderTranslation(val as any)} value={val} />)}
                        </Picker>
                    ]}
                    submitAction={
                        <ActionButton action={() => { setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => setScreenIndex(screenIndex - 1)} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title={'Je aktuálne k adopcii?'}
                    text={'Vyberte jednu z možností ktorá najviac špecifikuje zvieratko ktoré sa chystáte pridať.'}
                    inputComponents={[
                        <Picker selectedValue={(animal.adopted) ? 'ADOPTED' : 'NOT_ADOPTED'} onValueChange={(itemValue, itemIndex) => updateAnimal('adopted', ((itemValue == 'ADOPTED' ? true : false)))} >
                            {["NOT_ADOPTED","ADOPTED"].map((val, index) => <Picker.Item label={Animal.getAdoptionTranslation(val as any)} value={val} />)}
                        </Picker>
                    ]}
                    submitAction={
                        <ActionButton action={() => { setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => setScreenIndex(screenIndex - 1)} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Ake plemeno je toto zvieratko?'
                    text='Zadajte všeobecný popis alebo konkrétne pomenovanie plemena zvieratka. Napríklad, miešanec ovčiaka a colie alebo Yorkshírsky terier.'
                    inputComponents={[
                        <InputField key={"Animal.breed"} value={animal.breed} style={{margin: 0}} placeholder={"Nemecký ovčiak"} multiline={true} onEndEditing={(e) => updateAnimal('breed', e.nativeEvent.text)}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(isDescriptionValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1);  }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title={'Ako sa toto zvieratko volá?'}
                    text='Zadajte jednoduchý a krátky názov vašej udalosti ktorá ju vystihne v pár slovách.'
                    inputComponents={[
                        <InputField key={"Animal.name"} value={animal.name} style={{margin: 0}} placeholder='názov zvieratka' onEndEditing={(e) => updateAnimal('name', e.nativeEvent.text)}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(isNameValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => setScreenIndex(screenIndex - 1)} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Aký je príbeh a charakter tohto zvieratka?'
                    text='Príbeh ktorý si toto zvieratko prežilo ho zblíži s potencionálnym majiteľom, okrem príbehu je vhodný aj popis zvieratka a jeho charakter.'
                    inputComponents={[
                        <InputField key={"Animal.desc"} value={animal.description} style={{margin: 0}} placeholder={"popis zvieratka \n\n"} multiline={true} onEndEditing={(e) => updateAnimal('description', e.nativeEvent.text)}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(isDescriptionValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1);  }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Kedy sa toto zvieratko narodilo?'
                    text='Zadajte dátum a čas narodenia tohto zvieratka. Jeho vek slúži k filtrovaniu a oboznámeniu potencionálneho majiteľa zvieratka.'
                    inputStyle={{margin: 0, marginTop: 0}}
                    inputComponents={[
                        <RNDateTimePicker display="spinner" mode="datetime" value={new Date(animal.birthDate)} style={{flex: 1}} onChange={(event, _) => updateAnimal('birthDate', new Date(event.nativeEvent.timestamp!))}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Koľko zvieratko váži?'
                    text='Zadajte váhu zvieratka (číslom v kilogramoch). Tento údaj pomáha potencionálnemu majiteľovi pri zvažovaní adopcie.'
                    inputComponents={[
                        <InputField key={"Animal.weight"} value={animal.weight == 0 ? '' : animal.weight.toString()} style={{margin: 0}} placeholder={"4.5 kg"} multiline={true} onEndEditing={(e) => updateAnimal('weight', parseFloat(e.nativeEvent.text))}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(isDescriptionValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1);  }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Akej farby je zvieratko?'
                    text='Zadajte farbu zvieratka. Tento údaj pomáha potencionálnemu majiteľovi pri zvažovaní adopcie.'
                    inputComponents={[
                        <InputField key={"Animal.color"} value={animal.color} style={{margin: 0}} placeholder={"hnedý s bielými fľakmi"} multiline={true} onEndEditing={(e) => updateAnimal('color', e.nativeEvent.text)}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(isDescriptionValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1);  }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} 
                    header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Ako táto zvieratko vyzerá?'
                    text='Nahrajte niekoľko obrázkov ktoré ukážu tuláčika ktorý hľadá domov! Fotky sú veľmi dôležitým aspektom pri oslovovaní potenciálnych majiteľov.'
                    inputStyle={{margin: 0}}
                    inputComponents={[
                        <ScrollView ref={imageScrollRef} horizontal={true} showsHorizontalScrollIndicator={false} pagingEnabled={true} contentContainerStyle={{flexDirection: 'row'}}>
                            <ImageContent text={'Nahrať obrázok'} margin={20} onLongPress={() => {}} />
                            {(animal.photos) ? animal.photos.map((image, index) => <ImageContent image={image} margin={20} index={index} onLongPress={deleteImageAlert} />) : <></>}
                        </ScrollView>,
                        <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15}}>
                            <Text style={{fontFamily: 'GreycliffCF-Medium', fontSize: 15, color: '#BDBDBD'}}>Nahrali ste {(animal.photos ?? []).length} {((animal.photos ?? []).length - 1 > 1) ? 'obrázky' : 'obrázok'} z maxima 10 obrázkov.</Text>
                        </View>
                    ]}
                    submitAction={
                        <ActionButton action={() => { if(areImagesValid()) setScreenIndex(screenIndex + 1); }} title={'Ďalej'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />} />
                <InputDialog.DataInput 
                    title='Charakterizujte zvieratko tagmi!'
                    text='Zadajte niekoľko krátkych a jednoduchých tagov ktoré najlepšie reprezentujú toto zvieratko.'
                    inputComponents={[
                        <InputField key={"Animal.tags"} style={{margin: 0}} placeholder='názov tagu' onSubmit={(e) => updateAnimal('tags', [...animal.tags, e.nativeEvent.text])}/>,
                        <TagsPillList tags={animal.tags} tagColor='black' pillTextStyle={{fontSize: 16, margin: 3}} style={{marginTop: 10}} onLongPress={(tag, index) => { deleteTagAlert(tag, index) }}/>
                    ]}
                    submitAction={
                        <ActionButton action={() => {
                            if(animal.tags == undefined || animal.tags.length == 0) animal.tags = ['Udalosť', 'Pomoc', 'Dobrovoľníctvo', 'Adopcie']
                            Notifications.showMessage('Zvieratko je pripravené!', 'Profil zvieratka obsahuje všetký potrebne dáta pre jejho vytvorenie, ich pravdivosť overte a pokračujte vytvorením tohto profilu!', "SUCCESS");
                            setScreenIndex(screenIndex + 1);
                         }} title={'Súhrn'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
                <InputDialog.DataInput 
                    title='Finálny súhrn profilu zvieratka'
                    text='Skontrolujte údaje vyplnené v predošlých krokoch, v prípade nutnej zmeny je možné sa vrátiť späť. '
                    inputComponents={[
                        <TagsPillList tags={animal.tags} tagColor='black' pillTextStyle={{fontSize: 16, margin: 3}} style={{marginTop: 3}} onLongPress={(tag, index) => { deleteTagAlert(tag, index) }}/>,
                        <ActionButton key={"Animal.type.overview"} iconStyle={{justifyContent: 'flex-start'}} iconPosition='LEFT' iconSize={25} icons={[require('../../../assets/animal_type.png')]} tintImage={'#C4C4C4'} action={() => setScreenIndex(0)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17, marginRight: 15}} viewStyle={{margin: 0, marginTop: 11}} title={Animal.getAnimalTypeTranslation(animal.type)} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Animal.gender.overview"} iconStyle={{justifyContent: 'flex-start'}} iconPosition='LEFT' iconSize={25} icons={[require('../../../assets/male.png')]} tintImage={'#C4C4C4'} action={() => setScreenIndex(1)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17, marginRight: 15}} viewStyle={{margin: 0, marginTop: 11}} title={Animal.getGenderTranslation(animal.gender)} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Animal.name.overview"} iconStyle={{justifyContent: 'flex-start'}} iconPosition='LEFT' iconSize={25} icons={[require('../../../assets/name.png')]} tintImage={'#C4C4C4'} action={() => setScreenIndex(4)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17, marginRight: 15}} viewStyle={{margin: 0, marginTop: 11}} title={animal.name} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Animal.desc.overview"} iconStyle={{justifyContent: 'flex-start'}} iconPosition='LEFT' iconSize={25} icons={[require('../../../assets/description.png')]} tintImage={'#C4C4C4'} action={() => setScreenIndex(5)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17, marginRight: 30}} viewStyle={{margin: 0, marginTop: 11}} title={animal.description} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Animal.birthDate.overview"}iconStyle={{justifyContent: 'flex-start'}} iconPosition='LEFT' iconSize={25} icons={[require('../../../assets/age.png')]} tintImage={'#C4C4C4'} action={() => setScreenIndex(6)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={formatDate(new Date(animal.birthDate))} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Animal.weight.overview"} iconStyle={{justifyContent: 'flex-start'}} iconPosition='LEFT' iconSize={25} icons={[require('../../../assets/weight.png')]} tintImage={'#C4C4C4'} action={() => setScreenIndex(7)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={animal.weight.toString() + ' kg'} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Animal.color.overview"} iconStyle={{justifyContent: 'flex-start'}} iconPosition='LEFT' iconSize={25} icons={[require('../../../assets/color.png')]} tintImage={'#C4C4C4'} action={() => setScreenIndex(8)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={animal.color} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Animal.breed.overview"} iconStyle={{justifyContent: 'flex-start'}} iconPosition='LEFT' iconSize={25} icons={[require('../../../assets/breed.png')]} tintImage={'#C4C4C4'} action={() => setScreenIndex(3)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17}} viewStyle={{margin: 0, marginTop: 11}} title={animal.breed} color={'#EAEAEA'} orientation="flex-start"/>,
                        <ActionButton key={"Animal.adopted.overview"} iconStyle={{justifyContent: 'flex-start'}} iconPosition='LEFT' iconSize={25} icons={[require('../../../assets/description.png')]} tintImage={'#C4C4C4'} action={() => setScreenIndex(2)} textStyle={{color: 'black', fontFamily: 'GreycliffCF-Regular', fontSize: 17, marginRight: 15}} viewStyle={{margin: 0, marginTop: 11}} title={Animal.getAdoptionTranslation((animal.adopted) ? 'ADOPTED' : 'NOT_ADOPTED')} color={'#EAEAEA'} orientation="flex-start"/>,
                    ]}
                    submitAction={
                        <ActionButton action={() => { 
                            publishContent();
                            navigation.goBack();
                         }} title={'Publikovať'} color={'#80B3FF'} orientation="center" returnAction={() => { setScreenIndex(screenIndex - 1); }} returnTitle="Späť"/>
                    }
                    closeHandler={() => closeAlert()} header={headerTitle}
                    progressComponent={<ProgressComponent numberOfScreens={(screenFlowRef.current?.getNumberOfScreens() ?? 1)} currentScreenIndex={screenIndex} />}/>
            </ScreenFlow>
          )}
        </SafeAreaInsetsContext.Consumer>
        
    )
}

export const NewAnimalDialog = observer(NewAnimalDialogRoot);