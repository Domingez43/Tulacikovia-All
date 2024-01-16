import {MongoClient} from 'mongodb';
import multer from 'multer';

// ! In production should be secured in file
const mongoCreds = 'root:rootpassword';
const DBURL = 'mongodb://'+mongoCreds+'@mongodb_container:27017/?authMechanism=DEFAULT';

export class StorageManager {

    storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'public/'); // Specify the directory where you want to save the uploaded files
        },
        filename: function (req, file, cb) {
          cb(null, Date.now() + '-' + file.originalname);
        },
    });
      
    upload = multer({ storage: this.storage, limits: { fileSize: 10485760 } });

}

export class DatabaseHelper {

  static getValueFromPairsBy(key: string, pairs: any[]) {
    const pair = pairs.find(p => p.startsWith(`${key}:`));
  
    if(!pair) return null;
  
    const [_, value] = pair.split(':');
  
    return value;
  }

}

export const DBClient = new MongoClient(DBURL);
export const StorageClient = new StorageManager();

