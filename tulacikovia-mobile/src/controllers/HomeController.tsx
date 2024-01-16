import { createStackNavigator } from '@react-navigation/stack';
import { NewAnimalDialog } from '../screens/Dialogs/NewAnimalDialog';
import { AppealDetailScreen } from '../screens/AppealDetailScreen';
import { AppealUserScreen } from '../screens/AppealUserScreen';
import { AdoptionRootScreen, AdoptionScreen } from '../screens/AdoptionScreen';

const Stack = createStackNavigator();

const HomeController = () => {
    return (
        <Stack.Navigator screenOptions={{cardStyle: {backgroundColor: '#FFFFFF'}}}>
          <Stack.Screen name="Home.User.List" component={AppealUserScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Home.User.Detail" component={AppealDetailScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
      );
}

export default HomeController;