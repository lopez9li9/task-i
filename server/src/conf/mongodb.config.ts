import { ConnectOptions } from 'mongoose';

export interface MongoDBConfig extends ConnectOptions {
  serverSelectionTimeoutMS?: number;
}
