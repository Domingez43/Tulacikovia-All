"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBClient = void 0;
const mongodb_1 = require("mongodb");
// ! In production should be secured in file
const mongoCreds = 'root:rootpassword';
const DBURL = 'mongodb://' + mongoCreds + '@mongodb_container:27017/?authMechanism=DEFAULT';
exports.DBClient = new mongodb_1.MongoClient(DBURL);
