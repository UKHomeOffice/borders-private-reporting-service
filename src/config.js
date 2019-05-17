const {PROTOCOL, INT_DOMAIN, PLATFORM_DATA_NAME} = process.env;

const config = {
    reportsDir: "/workflow-resources/reports",
    services: {
        platformData: {
            url: `${PROTOCOL}://${PLATFORM_DATA_NAME}.${INT_DOMAIN}`
        }
    }
};

export default config;