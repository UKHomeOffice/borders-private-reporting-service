import express from 'express';

import healthController from '../controllers/healthController';
import ReportingController from "../controllers/ReportingController";
import ReportService from "../services/ReportService";
import configConstants from "../utilities/configConstants";
import PlatformDataService from "../services/PlatformDataService";
import AuthorizationChecker from "../services/AuthorizationChecker";

const router = express.Router();

const config = configConstants();

const reportingController = new ReportingController(new ReportService(config, new AuthorizationChecker()), config,
    new PlatformDataService(config));

const wrap = fn => (...args) => fn(...args).catch(args[2]);

const reportsRouter = (keycloak) => {
    router
        .get('/', [keycloak.protect(), wrap(reportingController.listReports)]);
    router.get('/:reportName', [keycloak.protect(), wrap(reportingController.getReport)]);
    return router
};


export default reportsRouter;

