import { ContentFilter, MenuContent } from "../../components/MenuView";
import { AppealFilters, AppealFilterFields, Appeal } from "../../models/AppealModel";
import { appealStore } from "../../store/AppealStore";
import { userStore } from "../../store/UserStore";
import { Event } from "../../models/AppealModel";
import { Animal, AnimalFilterFields, AnimalFilters } from "../../models/AnimalModel";
import { animalStore } from "../../store/AnimalStore";

export const AnimalsContent = <F extends ContentFilter<AnimalFilters, AnimalFilterFields> = any>(overrideWith?: MenuContent) => {
    var contentFilter: ContentFilter<AnimalFilters, AnimalFilterFields> = new ContentFilter<AnimalFilters, AnimalFilterFields>(AnimalFilters.MY_ADOPTIONS, AnimalFilterFields.createdOn, -1);
  
    const getData = (params?: F) => {
        const _filter = params ?? contentFilter;
        return animalStore.animals ? [...animalStore.animals!.values()] as Animal[] : [];
    }
  
    const fetchData = async (params?: F, startOnIndex = 0) => {
        const _filter = params ?? contentFilter;

        var data = await Animal.getList<Animal>([ AnimalFilters.MY_ADOPTIONS, _filter.filter], { limit: 6, sort: _filter.sortDirection, sortBy: _filter.sortBy }, userStore.token, startOnIndex, ['spieces:'+_filter.param]);
        if(startOnIndex) animalStore.addObjects(data);
        else animalStore.refreshWithData(data);
        return animalStore.animals ? [...animalStore.animals!.values()] as Animal[] : data;
    }
  
    return overrideWith ? overrideWith : new MenuContent<F, Animal[], ContentFilter<AnimalFilters, AnimalFilterFields>>('ANIMALS', 'Adopcie', contentFilter, undefined, undefined, fetchData, getData);
  }