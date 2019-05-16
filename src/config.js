const {PROTOCOL, INT_DOMAIN, OPERATIONAL_POSTGREST_NAME} = process.env;

const config = {
    reportsDir: "/workflow-resources/reports",
    services: {
        operationalData: {
            url: `${PROTOCOL}://${OPERATIONAL_POSTGREST_NAME}.${INT_DOMAIN}`
        }
    }
};

export default config;