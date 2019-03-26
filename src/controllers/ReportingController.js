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
        const token = req.kauth.grant.access_token.token;

        const email = req.kauth.grant.access_token.content.email;
        const currentUser = await this.platformDataService.currentUserShift(email, token);
        const teams = await this.platformDataService.getTeams(token);

        if (!currentUser) {
            this.unauthorizedResponse(email, res);
        } else {
            const teamCodes = teams!==null ? teams.map( ({ teamcode, teamid }) => ({ teamcode, teamid })) : [];
            const report = await this.reportingService.report(reportName, currentUser, teamCodes);
            
            if (report) {
                const options = {
                    headers: {
                        'access_token': token
                    }
                };
                res.status(200, options).send(report);
            } else {
                responseHandler.res({
                    code: 401,
                    message: 'Current user not authorized to view report.'
                }, null, res);
            }
        }
    }

    unauthorizedResponse(email, res) {
        logger.warn(`Current user ${email} not authorized to make this request`);
        responseHandler.res({
            code: 404,
            message: 'Current user not authorized to view reports. No shift information available'
        }, null, res);
    }

    async listReports(req, res) {
        const email = req.kauth.grant.access_token.content.email;
        const token = req.kauth.grant.access_token.token;
        const currentUser = await this.platformDataService.currentUserShift(email, token);
        if (!currentUser) {
            this.unauthorizedResponse(email, res);
        } else {
            const listOfReports = await this.reportingService.reports(currentUser);
            responseHandler.res(null, listOfReports, res);
        }
    }

}


export default ReportingController;
