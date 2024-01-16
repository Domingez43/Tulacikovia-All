import { ContentFilter, MenuContent } from "../../components/MenuView";
import { AppealFilters, AppealFilterFields, Appeal } from "../../models/AppealModel";
import { appealStore } from "../../store/AppealStore";
import { userStore } from "../../store/UserStore";
import { Event } from "../../models/AppealModel";

export const EventsContent = <T extends ContentFilter<AppealFilters, AppealFilterFields> = any>(overrideFilter?: T, key: string = 'EVENTS', title: string = 'Udalosti') => {
    var contentFilter: ContentFilter<AppealFilters, AppealFilterFields> = overrideFilter ?? new ContentFilter<AppealFilters, AppealFilterFields>(AppealFilters.MY_APPEALS, AppealFilterFields.createdOn, -1);
  
    function getFilterFunction(filter: AppealFilters) {
        switch(filter) {
            case AppealFilters.ACTUAL:
                return (value: Event, index: number, array: Event[]) => (new Date(value.endDate) >= new Date() && !value.draft && !value.archived) ? value : undefined;
            case AppealFilters.PAST_DATE:
                return (value: Event, index: number, array: Event[]) => new Date(value.endDate) < new Date() && !value.draft && !value.archived;
            case AppealFilters.DRAFTS:
                return (value: Event, index: number, array: Event[]) => value.draft && !value.archived;
            case AppealFilters.ARCHIVE:
                return (value: Event, index: number, array: Event[]) => value.archived;
            default: 
                return (value: Event, index: number, array: Event[]) => true; 
        }
    }
  
    function getSortFunction(sort: AppealFilterFields, sortDirection: number) {
      switch(sort) {
          case AppealFilterFields.startDate:
              return (e1: Event, e2: Event) => (new Date(e1.startDate).getTime() > new Date(e2.startDate).getTime()) ? sortDirection :  -1 * sortDirection;
          case AppealFilterFields.endDate:
              return (e1: Event, e2: Event) => (new Date(e1.endDate).getTime() > new Date(e2.endDate).getTime()) ? sortDirection : -1 * sortDirection;
          case AppealFilterFields.type:
              return (e1: Event, e2: Event) => (e1.type > e2.type) ? sortDirection : -1 * sortDirection;
          case AppealFilterFields.createdOn:
              return (e1: Event, e2: Event) => (new Date(e1.createdOn).getTime() > new Date(e2.createdOn).getTime()) ? sortDirection : -1 * sortDirection;
      }
    }
  
    const getData = (params?: T) => {
        const _filter = params ?? contentFilter;
        return (appealStore.appeals && appealStore.appeals.size > 0) ? [...appealStore.appeals].map(([_, value]) => value as Event).filter(getFilterFunction(_filter.filter)!).sort(getSortFunction(_filter.sortBy, _filter.sortDirection)) : [];
    }
  
    const fetchData = async (params?: T, startOnIndex = 0) => {
        const _filter = params ?? contentFilter;
        
        var data = await Appeal.getList<Event>([AppealFilters.MY_APPEALS, _filter.filter], { limit: 5, sort: _filter.sortDirection, sortBy: _filter.sortBy }, userStore.token, startOnIndex, _filter.param);
        if(startOnIndex) appealStore.addEvents(data);
        else appealStore.refreshWithData(data);
        return [...appealStore.appeals!.values()] as Event[];
    }
  
    return new MenuContent<T, Event[], ContentFilter<AppealFilters, AppealFilterFields>>(key, title, contentFilter, undefined, undefined, fetchData, getData);
  }