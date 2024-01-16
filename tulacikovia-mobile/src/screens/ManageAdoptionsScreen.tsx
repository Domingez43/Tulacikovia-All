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
import { SwipeListView } from "react-native-swipe-list-view";
import { appealStore } from "../store/AppealStore";
import { EventListProps, ContentListItem, ContentListActions } from "./EventScreen";
import { AdoptionGridItem, GridListComponent } from "../components/GridList";
import { EmptyListComponent } from "../components/EmptyListComponent";

export const ManageAdoptionsRootScreen = ({navigation}: any) => {
  const [selectedList, setSelectedList] = useState('DOGS');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [swipedNumber, setSwipedNumber] = useState(0);
  const [sortType, setSortType] = useState(AnimalFilterFields.createdOn);
  const [sortDirection, setSortDirection] = useState(-1);
  const [filter, setFilter] = useState<AnimalFilters[]>([AnimalFilters.NONE]);
  const [filterParam, setFilterParam] = useState<AnimalSpieces>(AnimalSpieces.DOG);

  useEffect(() => {
    setSwipedNumber(0);
    Animal.getList<Animal>([AnimalFilters.SPIECES, AnimalFilters.MY_ADOPTIONS, ...filter ?? AnimalFilters.NONE], { limit: 10, sort: sortDirection, sortBy: sortType }, userStore.token, 0, ['spieces:'+filterParam]).then(data => {
      setAnimals([...animals, ...data]);
    });
  }, [sortDirection, sortType]);

  useEffect(() => {
    setSwipedNumber(0);
    Animal.getList<Animal>([AnimalFilters.SPIECES, AnimalFilters.MY_ADOPTIONS, ...filter ?? AnimalFilters.NONE], { limit: 10, sort: sortDirection, sortBy: sortType }, userStore.token, 0, ['spieces:'+filterParam]).then(data => {
      setAnimals(data);
    });
  }, [filterParam, filter]);

  const setTagFilter = (tag: string) => {
    switch(tag) {
      case 'Náhodné':
        setFilter([AnimalFilters.NONE]);
        break;
      case 'Samčekovia':
        setFilter([AnimalFilters.MALES, ...filter.filter(item => item == AnimalFilters.ADOPTED)]);
        break;
      case 'Samičky':
        setFilter([AnimalFilters.FEMALES, ...filter.filter(item => item == AnimalFilters.ADOPTED)]);
        break;
      case 'Mláďatá':
        setFilter([AnimalFilters.CUBS, ...filter.filter(item => item == AnimalFilters.ADOPTED)]);
        break;
      case 'Pridať zvieratko':
        navigation.push('Adoption.Organisation.Detail');
        break;
      case 'Už adoptovaný':
        if(filter.filter(item => item == AnimalFilters.ADOPTED).length > 0) setFilter([...filter.filter(item => item != AnimalFilters.ADOPTED)]);
        else setFilter([...filter, AnimalFilters.ADOPTED]);
    }
  }

  return (
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: insets?.bottom, paddingTop: insets?.top}} style={{backgroundColor: 'white'}}>
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
              <TagsPillList tags={['Pridať zvieratko', 'Náhodné', 'Už adoptovaný', 'Samčekovia', 'Samičky', 'Mláďatá']} 
                            tagColor='black' 
                            tagTextColor="white" 
                            pillTextStyle={{fontSize: 16, margin: 2.5}} 
                            style={{marginTop: 17}} 
                            scrollable={true} 
                            insets={{left: 15, right: 15}} 
                            action={(tag) => setTagFilter(tag)}/>
              {(animals.length == 0) ? <EmptyListComponent/>
                                     : <View style={{marginTop: 15}}>
                                        <GridListComponent data={animals} gridComponent={(item: Animal) => <AdoptionGridItem key={item.id + item.name} title={item.name} subTitle={item.breed} image={item.photos[0]} width={(Dimensions.get('window').width / 2) - 20} height={(Dimensions.get('window').height / 4) - 10} gender={item.gender} onPress={() => navigation.push('Adoption.Organisation.Detail', { animal: item } )}/> } />
                                      </View>}
            </View>
          </ScrollView>
        )}
      </SafeAreaInsetsContext.Consumer>
  )
}

export const ManageAdoptionsScreen = observer(ManageAdoptionsRootScreen);

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