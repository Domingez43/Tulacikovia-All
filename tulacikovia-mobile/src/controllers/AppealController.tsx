import { createStackNavigator } from '@react-navigation/stack';
import { EventScreen } from '../screens/EventScreen';
import { NewEventDialog } from '../screens/Dialogs/NewEventDialog';
import { AppealDetailScreen } from '../screens/AppealDetailScreen';
import { NewAppealDialog } from '../screens/Dialogs/NewAppealDialog';

const Stack = createStackNavigator();

const AppealController = () => {
    return (
        <Stack.Navigator screenOptions={{cardStyle: {backgroundColor: '#FFFFFF'}}}>
          <Stack.Screen name="Event.Organisation.List" component={EventScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Event.Organisation.New" component={NewEventDialog} options={{headerShown: false}}/>
          <Stack.Screen name="Appeal.Organisation.New" component={NewAppealDialog} options={{headerShown: false}}/>
          <Stack.Screen name="Event.Organisation.Detail" component={AppealDetailScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
      );
}

export default AppealController;