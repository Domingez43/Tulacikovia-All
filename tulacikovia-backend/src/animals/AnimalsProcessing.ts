import { plainToInstance } from "class-transformer";
import { Animal, AnimalFilterFields, AnimalFilters } from "../models/AnimalsModel";
import { ObjectId } from "mongodb";
import { DatabaseHelper } from "../database/database";
import { AppealFilters, DBFilterOptions, Appeal, AppealType } from "../models/AppealModel";

export class AnimalsProcessing {

    static async validateAnimalObject(author: ObjectId, data: any, forOperation: "create" | "update" | "delete") {
        data.owner = new ObjectId(author);
        var animalObject = plainToInstance<Animal, any>(Animal, data as unknown, {groups: [forOperation], exposeUnsetFields: false});
        if (!animalObject.isComplete()) throw new Error("Couldn't create Animal profile because the profile data are missing required details.");
        return animalObject;
    }

    static async getList(owner: ObjectId, applyFilters: AnimalFilters[], filterOptions: DBFilterOptions<AnimalFilterFields>, skip: number = 0, params?: any[]): Promise<Animal[]> {
        var targetFilters = applyFilters.map((filter) => {
            switch(filter) {
                case AnimalFilters.SPIECES:
                    if(!params) return;
                    var itemsStr = DatabaseHelper.getValueFromPairsBy('spieces', params);
                    var items = itemsStr.split(';');
                    return Animal.getFilterQuery(filter, items);
                case AnimalFilters.MY_ADOPTIONS:
                    return Animal.getFilterQuery(filter, owner);
                default:
                    return Animal.getFilterQuery(filter);
            }
        })

        var content: Animal[] = (await Animal.getList(Object.assign({}, ...targetFilters), filterOptions, skip)).filter(obj => obj.type != undefined).map(object => {
            return plainToInstance(Animal, object, { groups: ['read.public']});
        });
        return content;
    }

    static async deleteProfile(animal: string | Animal, caller: string){
        const _animal = ((animal as Animal).id) ? plainToInstance(Animal, animal, { strategy: 'exposeAll', groups: ['update'] }) : undefined;
        return (_animal) ? await (_animal as Animal).deleteFromDatabase(new ObjectId(caller)) : Animal.deleteById(new ObjectId(animal as string), new ObjectId(caller));
    }

}