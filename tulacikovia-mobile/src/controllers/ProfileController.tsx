import { createStackNavigator } from '@react-navigation/stack';
import { EventScreen } from '../screens/EventScreen';
import { NewEventDialog } from '../screens/Dialogs/NewEventDialog';
import { AppealDetailScreen } from '../screens/AppealDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NewAppealDialog } from '../screens/Dialogs/NewAppealDialog';

const Stack = createStackNavigator();

const ProfileController = () => {
    return (
        <Stack.Navigator screenOptions={{cardStyle: {backgroundColor: '#FFFFFF'}}}>
          <Stack.Screen name="Profile" component={ProfileScreen} options={{headerShown: false}} />
          <Stack.Screen name="Profile.User.Detail" component={AppealDetailScreen} options={{headerShown: false}} />
          <Stack.Screen name="Profile.Organisation.New" component={NewEventDialog} options={{headerShown: false}}/>
          <Stack.Screen name="Profile.Organisation.NewAppeal" component={NewAppealDialog} options={{headerShown: false}}/>
          <Stack.Screen name="Profile.Organisation.Detail" component={AppealDetailScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
      );
}

export default ProfileController;