import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl =
  `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}` +
  `@cluster0.0krd2.mongodb.net/myDatabase?retryWrites=true&w=majority`;

const mongo = new MongoClient(mongoUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

await mongo.connect();
const database = mongo.db('BodyFriendly');

export default database;
