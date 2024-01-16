import { createStackNavigator } from '@react-navigation/stack';
import { EventScreen } from '../screens/EventScreen';
import { NewEventDialog } from '../screens/NewEventDialog';
import { AppealDetailScreen } from '../screens/AppealDetailScreen';
import { AppealUserScreen } from '../screens/AppealUserScreen';
import { MapScreen } from '../screens/MapScreen';

const Stack = createStackNavigator();

const MapsController = () => {
    return (
        <Stack.Navigator screenOptions={{cardStyle: {backgroundColor: '#FFFFFF'}}}>
          <Stack.Screen name="Maps.User.map" component={MapScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Maps.User.Detail" component={AppealDetailScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
      );
}

export default MapsController;