import { MongoClient, Db } from 'mongodb';
import { dbCredentials } from '../../config';

const connect = (): Promise<Db> => new Promise((resolve, reject) => {
  const client = new MongoClient(`mongodb+srv://${dbCredentials.user}:${dbCredentials.pass}@${dbCredentials.host}/${dbCredentials.dbName}?retryWrites=true&w=majority `);
  client.connect((err) => {
    if (err) return reject(err);
    return resolve(client.db(dbCredentials.dbName));
  });
});

export const db = connect; 