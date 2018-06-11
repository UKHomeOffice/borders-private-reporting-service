

const port = process.env.PORT || 8080;

const baseUrl = process.env.NODE_ENV === 'production' ? `${process.env.REPORTING_SERVICE_NAME}.${process.env.DOMAIN}`:
    `localhost:${port}`;

const configConstants = () => {
    return {
        reportsDir: "/workflow-resources/reports",
        baseUrl: baseUrl
    }
};

export default configConstants;
