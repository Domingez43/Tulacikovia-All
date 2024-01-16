import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { observer } from 'mobx-react';
import { authDetails } from "../store/AuthStore";
import { userStore } from "../store/UserStore";

@observer
export class SecondScreen extends React.Component {

  render(): React.ReactNode {
    return (
      <View style={styles.container}>
        <Text>Second screen {userStore.userProfile?.name}</Text>
        <View style={{flexDirection: 'row', gap: 10}}>
          <TouchableOpacity onPress={() => { 
            console.log('Setting name');
            // authDetails.setToken();
          }}>
            <Text style={{color: 'blue', margin: 10}}>Add one</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { 
            userStore.userProfile!.name = "Fero";
          }}>
            <Text style={{color: 'red', margin: 10}}>Remove one</Text>
          </TouchableOpacity>
        </View>
        
        <StatusBar style="auto" />
      </View>
    )
  }

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
});