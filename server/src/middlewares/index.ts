import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import { Application } from 'express';

const middlewares = (app: Application) => {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());
  app.use(morgan('[:method] :url :status :response-time ms - :remote-addr - :user-agent - :referrer'));
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
};

export default middlewares;
