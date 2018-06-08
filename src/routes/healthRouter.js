import express from 'express';

import healthController from '../controllers/healthController';

const healthRouter = express.Router();

healthRouter
    .get('/healthz', [healthController.healthCheck]);

healthRouter
    .get('/readiness', [healthController.readinessCheck]);

export default healthRouter;

