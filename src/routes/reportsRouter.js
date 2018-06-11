import express from 'express';

import healthController from '../controllers/healthController';
import ReportingController from "../controllers/ReportingController";
import ReportService from "../services/ReportService";
import configConstants from "../utilities/configConstants";

const router = express.Router();

const config = configConstants();

const reportingController = new ReportingController(new ReportService(config), config);

const wrap = fn => (...args) => fn(...args).catch(args[2]);

const reportsRouter = (keycloak) => {
    router
        .get('/', [wrap(reportingController.listReports)]);
    router.get('/:reportName', [wrap(reportingController.getReport)]);
    return router
};


export default reportsRouter;

