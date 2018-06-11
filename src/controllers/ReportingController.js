import responseHandler from "../utilities/handlers/responseHandler";
import path from 'path';

class ReportingController {
    constructor(reportingService, config) {
        this.reportingService = reportingService;
        this.config = config;
        this.listReports = this.listReports.bind(this);
        this.getReport = this.getReport.bind(this);
    }

    async getReport(req, res) {
        const {reportName} = req.params;
        res.sendFile(`${this.config.reportsDir}/${reportName}`);
    }

    async listReports(req, res) {
        const baseUrl = `${req.protocol}://${req.get('host')}/api/reports/`;
        const listOfReports = await this.reportingService.reports(baseUrl);
        responseHandler.res(null, listOfReports, res);
    };

}


export default ReportingController;