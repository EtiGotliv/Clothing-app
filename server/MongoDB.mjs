import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl =
  `mongodb+srv://site_data_user:${process.env.MONGO_DB_PASSWORD}` +
  `@tabble-all-clothing.ijibl.mongodb.net/myDatabase?retryWrites=true&w=majority`;

const mongo = new MongoClient(mongoUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

await mongo.connect();
const database = mongo.db('site_data_user');

export default database;
