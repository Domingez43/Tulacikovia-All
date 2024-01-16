import {UserStore, userStore} from './UserStore';
import { RootStoreModel } from '../models/RootStore';
import { AuthStore, authDetails } from './AuthStore';
import { appealStore, AppealStore } from './AppealStore';
import { animalStore, AnimalStore } from './AnimalStore';

class RootStore implements RootStoreModel {
  userStore: UserStore = userStore;
  authStore: AuthStore = authDetails;
  AppealStore: AppealStore = appealStore;
  animalStore: AnimalStore = animalStore;
};

export default new RootStore();