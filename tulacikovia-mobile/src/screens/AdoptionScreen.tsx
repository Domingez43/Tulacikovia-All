import { observer } from "mobx-react"
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import Menu, { SliderMenuColoring } from '../components/MenuView';
import React, { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { TagsPillList } from "../components/TagsPillList";
import TinderCard from 'react-tinder-card';
import { Animal, AnimalFilterFields, AnimalFilters, AnimalSpieces } from "../models/AnimalModel";
import { userStore } from "../store/UserStore";

const CARD_HEIGHT = Dimensions.get('window').height * 0.58;

export const AdoptionCard = ({animal, style, onPress}: {animal: Animal, style: any, onPress?: () => void}) => {
  const image = (animal.gender == "MALE") ? require('../../assets/male.png') : require('../../assets/female.png');

  function timeAgo(date: Date) {
    const now = new Date();
    const ago = Math.round((now.getTime() - new Date(date).getTime()) / 1000);
    const minutes = Math.floor(ago / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
  
    if (years > 0) {
      if (years == 1) {
        return `pred ${years} rokom`;
      } else { 
        return `pred ${years} rokmi`;
      }
    }
  
    if (months > 0) {
      if (months == 1) {
        return `pred ${months} mesiacom`;  
      } else {
        return `pred ${months} mesiacmi`;
      }
    }
  
    if (days > 0) {
      if (days == 1) { 
        return `pred ${days} dnom`;
      } else {
        return `pred ${days} dňami`;
      }
    }
  
    if (hours > 0) {
      if (hours == 1) {
        return `pred ${hours} hod.`;
      } else {
        return `pred ${hours} hod.`; 
      }
    }
  
    if (minutes > 0) {
      if (minutes == 1) {
        return `pred ${minutes} min.`;
      } else {
        return `pred ${minutes} min.`;
      }
    }
  
    return `pred ${ago} sec.`;
  }
  
  return (
    <TouchableOpacity style={{...style, backgroundColor: 'white'}} activeOpacity={1} onPress={onPress}>
      <Image style={{flex: 1, height: CARD_HEIGHT}} source={{uri: animal.photos[0]}} contentFit="cover" transition={200} />
      <View style={{backgroundColor: 'white', flex: 1, flexGrow: 1, position: 'absolute', bottom: 15, left: 15, right: 15, borderRadius: 13, padding: 15, gap: 5}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontFamily: 'GreycliffCF-ExtraBold', fontSize: 25 }}>{animal.name}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', paddingLeft: 15, gap: 3}}>
            <Image style={{width: 18, aspectRatio: 1, marginBottom: 1, marginTop: 2}} source={require('../../assets/Location.png')} contentFit="cover" transition={200} tintColor={'#C4C4C4'}/>
            <Text style={{fontFamily: 'GreycliffCF-ExtraBold', fontSize: 22, color: '#C4C4C4' }}>22km</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', marginRight: 10}}>
          <Image style={{width: 18, aspectRatio: 1, marginBottom: 1, marginTop: 2}} source={image} contentFit="cover" transition={200} tintColor={'#80B3FF'}/>
          <Text style={{fontFamily: 'GreycliffCF-Bold', fontSize: 15, color: '#C4C4C4'}}><Text style={{color: '#80B3FF'}}>{animal.breed}</Text> • 2 roky • {timeAgo(animal.createdOn)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const useRefs = () => {
  const refsByKey = useRef<Record<string, any | null>>({})
  const setRef = (element: any | null, key: string) => refsByKey.current[key] = element;
  return {refsByKey: refsByKey.current, setRef};
}

export const AdoptionRootScreen = ({navigation}: any) => {
  const [selectedList, setSelectedList] = useState('DOGS');
  const {refsByKey, setRef} = useRefs();
  const cardRefs = Object.values(refsByKey).filter(Boolean) 
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [swipedNumber, setSwipedNumber] = useState(0);
  const [sortType, setSortType] = useState(AnimalFilterFields.createdOn);
  const [sortDirection, setSortDirection] = useState(-1);
  const [filter, setFilter] = useState<AnimalFilters>(AnimalFilters.NONE);
  const [filterParam, setFilterParam] = useState<AnimalSpieces>(AnimalSpieces.DOG);


  useEffect(() => {
    setSwipedNumber(0);
    Animal.getList<Animal>([AnimalFilters.SPIECES, AnimalFilters.FOR_ADOPTION, filter ?? AnimalFilters.NONE], { limit: 10, sort: sortDirection, sortBy: sortType }, userStore.token, 0, ['spieces:'+filterParam]).then(data => {
      setAnimals([...animals, ...data]);
    });
  }, [sortDirection, sortType]);

  useEffect(() => {
    setSwipedNumber(0);
    Animal.getList<Animal>([AnimalFilters.SPIECES, AnimalFilters.FOR_ADOPTION, filter ?? AnimalFilters.NONE], { limit: 10, sort: sortDirection, sortBy: sortType }, userStore.token, 0, ['spieces:'+filterParam]).then(data => {
      setAnimals(data);
    });
  }, [filterParam, filter]);

  const setTagFilter = (tag: string) => {
    switch(tag) {
      case 'Náhodné':
        setFilter(AnimalFilters.NONE);
        break;
      case 'Samčekovia':
        setFilter(AnimalFilters.MALES);
        break;
      case 'Samičky':
        setFilter(AnimalFilters.FEMALES);
        break;
      case 'Mláďatá':
        setFilter(AnimalFilters.CUBS);
        break;
    }
  }

  return (
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={{paddingBottom: insets?.bottom, paddingTop: insets?.top}} style={{backgroundColor: 'white'}}>
            <View style={styles.topPortion}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginRight: 20, gap: 5, marginBottom: 1}}>
                      <Image style={{width: 21, aspectRatio: 1}} source={require('../../assets/heart.png')} contentFit="cover" transition={200} tintColor={'#80B3FF'} />
                      <Text style={{fontFamily: 'GreycliffCF-Heavy', fontSize: 27, color: '#80B3FF' }}>Adopcie</Text>
              </View>
              <Menu.TextMenu.Handler selectedItem={selectedList}>
                  <Menu.TextMenu.Item key={"DOGS"} viewKey="DOGS" title={"Psíky"} handle={(key) => { setFilterParam(AnimalSpieces.DOG); setSelectedList("DOGS"); }} selectedColor="black" />
                  <Menu.TextMenu.Item key={"CATS"} viewKey="CATS" title={"Mačky"} handle={(key) => { setFilterParam(AnimalSpieces.CAT); setSelectedList("CATS"); }} selectedColor="black"/>
                  <Menu.TextMenu.Item key={"BIRDS"} viewKey="BIRDS" title={"Vtáky"} handle={(key: string) => { setFilterParam(AnimalSpieces.BIRD); setSelectedList("BIRDS"); }} selectedColor="black"/>
                  <Menu.TextMenu.Item key={"FISH"} viewKey="FISH" title={"Ryby"} handle={(key: string) => { setFilterParam(AnimalSpieces.FISH); setSelectedList("FISH"); }} selectedColor="black"/>
                  <Menu.TextMenu.Item key={"RODENTS"} viewKey="RODENTS" title={"Hlodavce"}  handle={() => { setFilterParam(AnimalSpieces.RODENT); setSelectedList("RODENTS"); }} selectedColor="black"/>
              </Menu.TextMenu.Handler>
              <TagsPillList tags={['Náhodné', 'Samčekovia', 'Samičky', 'Mláďatá']} 
                            tagColor='black' 
                            tagTextColor="white" 
                            pillTextStyle={{fontSize: 16, margin: 2.5}} 
                            style={{marginTop: 17}} 
                            scrollable={true} 
                            insets={{left: 15, right: 15}} 
                            action={(tag) => setTagFilter(tag)}/>
              <View style={{flex: 1, height: CARD_HEIGHT}}> 
                <TinderCard preventSwipe={['up', 'down', 'left', 'right']} >
                  <View style={{margin: 15, borderRadius: 20, marginTop: 15, overflow: 'hidden', position: 'absolute',  width: Dimensions.get('window').width - 30, justifyContent: 'center', alignContent: 'center', alignItems: 'center', height: CARD_HEIGHT, padding: 20, backgroundColor: '#EAEAEA'}}>
                    <Text style={{fontFamily: 'GreycliffCF-Bold', textAlign: 'center'}}>Aktuálne nie sú dostupné žiadne ďalšie zvieratká v tejto kategórii k adopcii.</Text>
                  </View>
                </TinderCard>
                {animals?.map((animal, index) => {
                  return (
                    <TinderCard onSwipe={() => {
                      setSwipedNumber(prev => prev + 1);
                    }} ref={refObject => setRef(refObject, 'card_'+index)}>
                      <AdoptionCard animal={animal} style={{margin: 15, borderRadius: 20, marginTop: 15, overflow: 'hidden', position: 'absolute',  width: Dimensions.get('window').width - 30}} onPress={() => navigation.push('Adoption.User.Detail', { animal: animal })}/>
                    </TinderCard>
                  )
                })}
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginRight: 22, marginLeft: 22, marginTop: 25, alignItems: 'center', zIndex: -1}}>
                <TouchableOpacity style={{flexDirection: 'row', gap: 8, alignItems: 'flex-end'}} onPress={() => { 
                  const index = animals.length - 1 - swipedNumber;
                  console.log('Restore card: ' + 'card_'+ (swipedNumber))
                  if(index + 1 < animals.length) refsByKey['card_'+ (index + 1)].restoreCard();
                  if(index < animals.length - 1) setSwipedNumber(prev => prev - 1);
                }}>
                  <Image style={{width: 13, aspectRatio: 1, transform: [{rotate: '180deg'}], marginBottom: 1}} source={require('../../assets/arrow.png')} contentFit="cover" transition={200} tintColor={'#C4C4C4'}/>
                  <Text style={{fontFamily: 'GreycliffCF-Bold', fontSize: 16, color: '#C4C4C4' }}>Späť</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flexDirection: 'row', gap: 7, alignItems: 'center'}} onPress={() => { 
                  cardRefs.forEach(cardRef => cardRef.restoreCard());
                  setSwipedNumber(0);
                }}>
                  <Image style={{width: 20, aspectRatio: 1, transform: [{rotate: '180deg'}]}} source={require('../../assets/reset.png')} contentFit="cover" transition={200} tintColor={'#C4C4C4'}/>
                  <Text style={{fontFamily: 'GreycliffCF-Bold', fontSize: 16, color: '#C4C4C4' }}>Znovu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaInsetsContext.Consumer>
  )
}

export const AdoptionScreen = observer(AdoptionRootScreen);

const styles = StyleSheet.create({
  locationTitle: {fontFamily: 'GreycliffCF-Heavy', fontSize: 27, lineHeight: 30, color: '#80B3FF' },
  topPortion: {flexDirection: 'column', justifyContent: 'space-between', marginTop: 25},
  title: { fontFamily: 'GreycliffCF-Heavy', fontSize: 42, marginLeft: 20, marginRight: 20, lineHeight: 46 },
  container: { flex: 1 },
  logoWrapper: { margin: 10, flexDirection: 'row', marginLeft: 20, marginTop: 25 },
  logo: { width: '57%', aspectRatio: 5 },
  imageWrapper: {margin: 25, marginTop: 20, marginBottom: 0, flexDirection: 'row', justifyContent: 'center'},
  image: { flex: 1},
  subText: {margin: 10, marginLeft: 30, marginRight: 30, marginTop: 35, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'stretch'},
  subHeader: {margin: 10, marginLeft: 15, marginRight: 15, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'stretch'},
  buttonWrapper: {margin: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'},
  bottomWrapper: {margin: 20, marginTop: 5, marginBottom: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'},
  button: {alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#80B3FF', padding: 25, borderRadius: 25, margin: 5},
  buttonText: {fontFamily: 'GreycliffCF-ExtraBold', fontSize: 20, color: 'white'},
});