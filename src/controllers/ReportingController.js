import responseHandler from "../utilities/handlers/responseHandler";
import * as logger from 'winston';

class ReportingController {
    constructor(reportingService, config, platformDataService) {
        this.reportingService = reportingService;
        this.config = config;
        this.platformDataService = platformDataService;
        this.listReports = this.listReports.bind(this);
        this.getReport = this.getReport.bind(this);
    }

    async getReport(req, res) {
        const {reportName} = req.params;
        const email = req.kauth.grant.access_token.content.email;
        const currentUser = await this.platformDataService.currentUserShift(email);

        if (!currentUser) {
            logger.warn(`Current user ${email} not authorized to make this request`);
            responseHandler.res({
                code: 404,
                message: 'Current user not authorized to view reports. No shift information available'
            }, null, res);
        } else {
            const report = await this.reportingService.report(reportName,  currentUser);
            if (report) {
                res.sendFile(`${this.config.reportsDir}/${reportName}`);
            } else {
                responseHandler.res({
                    code: 401,
                    message: 'Current user not authorized to view report.'
                }, null, res);
            }
        }
    }

    async listReports(req, res) {
        const baseUrl = `${req.protocol}://${this.config.baseUrl}/api/reports/`;
        const email = req.kauth.grant.access_token.content.email;
        const currentUser = await this.platformDataService.currentUserShift(email);
        if (!currentUser) {
            logger.warn(`Current user ${email} not authorized to make this request`);
            responseHandler.res({
                code: 404,
                message: 'Current user not authorized to view reports. No shift information available'
            }, null, res);
        } else {
            const listOfReports = await this.reportingService.reports(currentUser);
            const data = listOfReports.filter(x => x)
                .map((report) => {
                    const fileName = report.htmlName;
                    report.url = baseUrl + fileName;
                    return report;
                });
            responseHandler.res(null, data, res);
        }
    };

}


export default ReportingController;