import { createStackNavigator } from '@react-navigation/stack';
import { AdoptionRootScreen, AdoptionScreen } from '../screens/AdoptionScreen';
import { AnimalDetailScreen } from '../screens/AnimalDetailScreen';
import { ManageAdoptionsScreen } from '../screens/ManageAdoptionsScreen';
import { NewAnimalDialog } from '../screens/Dialogs/NewAnimalDialog';

const Stack = createStackNavigator();

const ManageAdoptionsController = () => {
    return (
        <Stack.Navigator screenOptions={{cardStyle: {backgroundColor: '#FFFFFF'}}}>
          <Stack.Screen name="Adoption.Organisation.List" component={ManageAdoptionsScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Adoption.Organisation.Detail" component={NewAnimalDialog} options={{headerShown: false}}/>
        </Stack.Navigator>
      );
}

export default ManageAdoptionsController;