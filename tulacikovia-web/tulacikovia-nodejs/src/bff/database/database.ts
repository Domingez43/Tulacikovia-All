import {MongoClient} from 'mongodb';

// ! In production should be secured in file
const mongoCreds = 'root:rootpassword';
const DBURL = 'mongodb://'+mongoCreds+'@mongodb_container:27017/?authMechanism=DEFAULT';

export const DBClient = new MongoClient(DBURL);
