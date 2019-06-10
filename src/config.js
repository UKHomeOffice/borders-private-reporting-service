const {PROTOCOL, INT_DOMAIN, PLATFORM_DATA_NAME, CORS_ORIGIN} = process.env;

const config = {
    reportsDir: "/workflow-resources/reports",
    services: {
        platformData: {
            url: `${PROTOCOL}${PLATFORM_DATA_NAME}.${INT_DOMAIN}`
        }
    },
    cors: {
        origin: CORS_ORIGIN
    }
};

module.exports = config;
