import fs from 'fs';
import cheerio from 'cheerio';
import {promisify} from "util";
import * as logger from 'winston';


const readFile = promisify(fs.readFile);
const readFiles = promisify(fs.readdir);

class ReportService {
    constructor(config, authorizationChecker) {
        this.reports = this.reports.bind(this);
        this.config = config;
        this.authorizationChecker = authorizationChecker;
    }


    async report(reportName, currentUser) {
        const fileName = `${this.config.reportsDir}/${reportName}`;
        const fileContent = await readFile(fileName, 'utf8');
        const html = cheerio.load(fileContent);
        if (this.authorizationChecker.isAuthorized(currentUser, html)) {
            logger.info(`${currentUser.email} authorized to see ${fileName}`);
            return html;
        } else {
            return null;
        }

    }

    async reports(currentUser) {
        const files = await readFiles(this.config.reportsDir);
        return Promise.all(files.map(async (file) => {
            const fileContent = await readFile(`${this.config.reportsDir}/${file}`, 'utf8');
            const html = cheerio.load(fileContent);
            if (this.authorizationChecker.isAuthorized(currentUser, html)) {
                logger.info(`${currentUser.email} authorized to see ${file}`);
                return {
                    name: html("meta[name='title']").attr("content"),
                    description: html("meta[name='description']").attr("content"),
                    htmlName: file
                };
            } else {
                return null;
            }
        }));
    }

}

export default ReportService;