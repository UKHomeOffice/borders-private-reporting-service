import express from 'express';
import ReportingController from "../controllers/ReportingController";
import ReportService from "../services/ReportService";
import config from "../config";
import PlatformDataService from "../services/PlatformDataService";
import AuthorizationChecker from "../services/AuthorizationChecker";

const router = express.Router();

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

