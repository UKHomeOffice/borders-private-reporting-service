import express from 'express';
import heathRouter from './healthRouter';

const router = express.Router();

const allRoutes = (keycloak) => {
     router.use(heathRouter);
     return router;

};

export default {
    allRoutes,
}

