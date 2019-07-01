import express from 'express';
import ConfigController from '../controllers/ConfigController';
import config from '../config'

const configRouter = express.Router();
const controller = new ConfigController(config);

configRouter.get('/config', [controller.clientConfig]);

export default configRouter;
