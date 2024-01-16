import { createStackNavigator } from '@react-navigation/stack';
import { AdoptionRootScreen, AdoptionScreen } from '../screens/AdoptionScreen';
import { AnimalDetailScreen } from '../screens/AnimalDetailScreen';

const Stack = createStackNavigator();

const AdoptionController = () => {
    return (
        <Stack.Navigator screenOptions={{cardStyle: {backgroundColor: '#FFFFFF'}}}>
          <Stack.Screen name="Adoption.User.List" component={AdoptionScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Adoption.User.Detail" component={AnimalDetailScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
      );
}

export default AdoptionController;