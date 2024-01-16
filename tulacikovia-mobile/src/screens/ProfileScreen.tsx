import { useState, useEffect, useReducer} from "react";
import { View, TouchableOpacity, Text, StyleSheet, Animated, ScrollView, Dimensions, RefreshControl } from "react-native";
import { observer } from 'mobx-react';
import React from "react";
import { userStore } from "../store/UserStore";
import { autorun } from "mobx";
import { appealStore } from "../store/AppealStore";
import { Appeal, AppealFilterFields, AppealFilters } from "../models/AppealModel";
import { EventList } from "./EventScreen";
import { Notice } from "../models/NoticeModel";
import { Badge } from "../models/BadgeModel";
import { TagsPillList } from "../components/TagsPillList";
import {Image} from 'expo-image';
import { Event } from "../models/AppealModel";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { APIClient } from "../apis/ServerRequests";
import Menu, { ContentFilter, MenuContent, MenuManager, SliderMenuColoring } from '../components/MenuView';
import { EmptyListComponent } from "../components/EmptyListComponent";
import { EventsContent } from "./Contents/EventsContent";
import { GridListComponent, AdoptionGridItem } from "../components/GridList";
import { Animal, AnimalFilterFields, AnimalFilters } from "../models/AnimalModel";
import { AnimalsContent } from "./Contents/AnimalsContent";

var dummy = {
  badge: new Badge('Nálepka Návštevníka', 'Nálepka ktorá je odovzdaná každému používateľ ktorý sa zúčastnil minimálne 5 udalostí.', 'EVENT', 5, 0, 'badge', "VISITOR_BADGE")
}

const NoticeComponent = ({notice}: {notice: Notice<any>}) => {
  return (
    <TouchableOpacity style={{width: '100%', backgroundColor: '#ECECEC', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12}}>
      {notice.subject ? <Image source={notice.icon} style={{flex: 1.5, aspectRatio: 1}}/>
                      : <></>}
      <View style={{flex: 7}}>
        <Text style={{fontFamily: 'GreycliffCF-Bold', fontSize: 15}}>{notice.title}</Text>
        <Text style={{fontFamily: 'GreycliffCF-DemiBold', fontSize: 13, color: '#B9B8B8', marginTop: 3}}>{notice.message}</Text>
      </View>
      {!notice.subject ? <Image source={require('../../assets/arrow.png')} style={{flex: 0.45, aspectRatio: 1, marginRight: 10}} tintColor={'black'}/>
                      : <Text style={{flex: 1.4, fontFamily: 'GreycliffCF-Heavy', fontSize: 18, color: '#B9B8B8', marginTop: 3, marginLeft: 5}}>
                          <Text style={{color: 'black'}}>{notice.subject.object.progress}</Text> / {notice.subject.object.target}
                        </Text>}
      
    </TouchableOpacity>
  )
}

const ProfileScreenRoot = ({navigation, route}: any) => {
  const [heatlhStatus, setHealthStatus] = useState(null);
  const [notices, setNotices] = useState<Notice<Badge | any>[]>([new Notice('Ako to vlastne funguje?', 'Ak chcete zistiť ako jednoducho dokážeš pomôcť pokračuj tu!', 'icon', 'help')]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [menuManager, setMenuManager] = useState<MenuManager>(new MenuManager().prepare([ EventsContent(new ContentFilter(AppealFilters.TYPE, AppealFilterFields.createdOn, -1, ['type:EVENT'])), EventsContent(new ContentFilter(AppealFilters.TYPE, AppealFilterFields.createdOn, -1, ['type:APPEAL']), 'APPEALS', 'Výzvy'), AnimalsContent() ], 'EVENTS'));
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  var userActions: {id: string, title: string, action: () => void}[] = [
    {id: 'log_out', title: 'Odhlásiť sa', action: () => {  userStore.setToken(undefined); userStore.userProfile = undefined; userStore.authProfile = undefined; appealStore.appeals = undefined; }},
    {id: 'change_details', title: 'Upraviť údaje', action: () => {}},
    {id: 'change_password', title: 'Zmeniť heslo', action: () => {}},
    {id: 'change_email', title: 'Zmeniť email', action: () => {}},
  ]

  useEffect(() => {
    const disposer = autorun(() => { console.log('Store changed to: ' + userStore.userProfile?.name); })
    fetchParticipationData().then(data => setAppeals(data));
    menuManager.menuList.get(menuManager.selectedMenu)!.fetchData!().then(_ => forceUpdate());
    return () => disposer();
  },[])

  useEffect(() => {
    menuManager.menuList.get(menuManager.selectedMenu)!.fetchData!().then(_ => forceUpdate());
  },[menuManager.selectedMenu])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchParticipationData().then(data => {
      console.log(data);
      setAppeals(data);
      setRefreshing(false);
    });
  }, []);

  async function fetchParticipationData() {
    var result = await APIClient.apiRequest<{list: Appeal[]}>(APIClient.buildEnpointWithQuery('content/list/myParticipations', { limit: 5, sortBy: 'createdOn', sort: '-1', startFrom: appeals.length}), { method: 'GET'}, userStore.token);
    return result.data?.list ?? [];
  }

  function getUserContentView() {
    return (
      <View style={{ gap: 10}}>
        <Text style={{marginLeft: 20, marginRight: 20, marginTop: 15, flex: 1, fontFamily: 'GreycliffCF-ExtraBold', fontSize: 17, color: 'black'}}>Udalosti ktorých sa účastnite</Text>
        <EventList listData={(appeals as Event[]) ?? []} navigation={navigation} route={(event) => {
          if(userStore.userProfile?.type == "ORGANIZATION") navigation.push('Profile.Organisation.New', { Event: Event });
          if(userStore.userProfile?.type == "USER") navigation.push('Profile.User.Detail', { event: event })
        }}/>
      </View>
    )
  }

  function getContentItem(key: string) {
    if(menuManager.menuList.get(key) == undefined) throw new Error('Cannot find menu content for key: ' + key); 

    switch(key){
      case 'EVENTS':
        const menuContent: MenuContent<ContentFilter<AppealFilters, AppealFilterFields>, Event[]> | undefined = (menuManager.menuList.get(key));
        const data = menuContent!.getData!();
        return <Menu.ContentView key={key+ '_content'} viewKey={key} component={(data.length != 0) ? <EventList listData={data} navigation={navigation} route={(event) => navigation.push('Profile.Organisation.New', { Event: event }) } /> : (data) ? <EmptyListComponent/> : <View />}/>
      case 'APPEALS':
        const _menuContent: MenuContent<ContentFilter<AppealFilters, AppealFilterFields>, Event[]> | undefined = (menuManager.menuList.get(key));
        const _data = _menuContent!.getData!();
        return <Menu.ContentView key={key+ '_content'} viewKey={key} component={(_data.length != 0) ? <EventList listData={_data} navigation={navigation} route={(appeal) => navigation.push('Profile.Organisation.NewAppeal', { appeal: appeal }) }  /> : (_data) ? <EmptyListComponent/> : <View />}/>
      case 'ANIMALS':
        const animalsMenuContent: MenuContent<ContentFilter<AnimalFilters, AnimalFilterFields>, Animal[]> | undefined = (menuManager.menuList.get(key));
        const animalsData = animalsMenuContent!.getData!(animalsMenuContent!.filters);
        return <Menu.ContentView key={key+ '_content'} viewKey={key} component={(animalsData.length != 0) ? <GridListComponent data={animalsData} gridComponent={(item: Animal) => <AdoptionGridItem key={item.id + item.name} title={item.name} subTitle={item.breed} image={item.photos[0]} width={(Dimensions.get('window').width / 2) - 20} height={(Dimensions.get('window').height / 4) - 10} gender={item.gender} onPress={() => navigation.push('Adoption.Organisation.Detail', { animal: item } )}/>} /> : (animalsData) ? <EmptyListComponent/> : <View />}/>
    }
  }

  function getOrganisationContentView() {
    const menuList = [...menuManager.menuList.values()];
    return (
      <View style={{marginTop: 15, gap: 15}}>
        <Menu.TextMenu.Handler selectedItem={menuManager.selectedMenu}>
            {menuList.map(menu => <Menu.TextMenu.Item key={menu.key + '_menu'} viewKey={menu.key} title={menu.title} handle={(key) => {
              menu.onSelect??(key);
              setMenuManager(menuManager.mutableUpdate('selectedMenu',key));
            }} selectedColor="black" />)}
        </Menu.TextMenu.Handler>
        <Menu.ContentController currentViewKey={menuManager.selectedMenu}>
          {menuList.map(menu => getContentItem(menu.key)!)}
        </Menu.ContentController>
      </View>
    )
  }

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <ScrollView bounces={true} showsVerticalScrollIndicator={false} scrollEnabled={true} style={{backgroundColor: 'white'}} contentInset={{top: insets?.top}} contentContainerStyle={{ paddingBottom: insets?.top}} onScroll={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
              const menuContent = menuManager.menuList.get(menuManager.selectedMenu);
              if(menuContent == undefined) throw new Error('Cannot get selected menu content from the MenuManager.');

              const dataLenght = menuContent.getData!().length ?? 0;
              menuContent.fetchData!(undefined, dataLenght).then(data => { if(data.length != dataLenght) forceUpdate()});
           }
          }} scrollEventThrottle={400} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
            <View style={styles.topPortion}>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginRight: 20, gap: 5, marginBottom: 5}}>
                        <Text style={styles.locationTitle}>{userStore.userProfile?.name ?? 'Profil'}</Text>
                    </View>
                    <Text style={styles.title}>Vitaj {(userStore.userProfile?.name ?? '').split(' ')[0]}, toto je tvoj profil!</Text>
                </View>
                <View>
                  <TagsPillList tags={userActions.map(action => action.title)} 
                                tagColor='black' 
                                tagTextColor="white" 
                                pillTextStyle={{fontSize: 16, margin: 4}} 
                                style={{marginTop: 23}} 
                                scrollable={true} 
                                insets={{left: 15, right: 15}} 
                                action={(tag) => userActions.filter(action => action.title == tag)[0].action()} />
                </View>
                <View style={{marginLeft: 17, marginRight: 17, marginTop: 15, gap: 10}}>
                  {notices.map(notice => <NoticeComponent notice={notice}/>)}
                  <NoticeComponent notice={new Notice<Badge>('Nálepka návštevníka', 'Pre získanie tejto nálepky sa musíte zúčastniť minimálne 5 udalostí.', require('../../assets/visitor_badge.png'), 'Badges.Detail','EVENT', dummy.badge)} />
                </View>
                {(userStore.userProfile?.type == "USER") ? getUserContentView() : getOrganisationContentView()}
            </View>
        </ScrollView>
      )}
    </SafeAreaInsetsContext.Consumer>
  )
}

export const ProfileScreen = observer(ProfileScreenRoot);

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