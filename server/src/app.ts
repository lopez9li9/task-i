import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { Application } from 'express';

import middlewares from './middlewares';
import server from './routes/routes';

import { MongoDBConfig } from './conf/mongodb.config';

dotenv.config();

const app: Application = express();

// Middleware
middlewares(app);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // wait time for server selection
  } as MongoDBConfig)
  .then(() => console.log('Database connection successful'))
  .catch((err) => console.error(err));

// Routes
app.use(server);

const DB_PORT = process.env.DB_PORT || 5050;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  app.listen(DB_PORT, () => {
    console.log(`Server is running on port ${DB_PORT}`);
  });
});
