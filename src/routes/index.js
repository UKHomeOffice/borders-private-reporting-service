import express from 'express';
import heathRouter from './healthRouter';
import reportsRouter from "./reportsRouter";
import configRouter from './ConfigRouter';

const router = express.Router();

const allRoutes = (keycloak) => {
     router.use(heathRouter);
     router.use(configRouter);
     router.use(reportsRouter(keycloak));
     return router;

};

export default {
    allRoutes,
}

