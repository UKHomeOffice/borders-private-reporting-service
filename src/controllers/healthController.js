import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from 'winston';

const healthCheck = (req, res) => {
    logger.info("Health check initiated");
    responseHandler.res(null, {"status": "OK"}, res);
};

const readinessCheck = (req, res) => {
    logger.info("Readiness check initiated");
    responseHandler.res(null, {"ready" : true}, res);
};

export default {
    healthCheck,
    readinessCheck
};
