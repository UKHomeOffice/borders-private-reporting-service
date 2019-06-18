const {OPERATIONAL_DATA_URL, CORS_ORIGIN, REPORTS_DIR} = process.env;

const config = {
    reportsDir: REPORTS_DIR || "/workflow-resources/reports",
    services: {
        platformData: {
            url: OPERATIONAL_DATA_URL
        }
    },
    cors: {
        origin: CORS_ORIGIN
    }
};

module.exports = config;
