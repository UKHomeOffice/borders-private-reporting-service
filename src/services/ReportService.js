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

    async report(reportName, currentUser, teams) {
        const fileName = `${this.config.reportsDir}/${reportName}`;
        const fileContent = await readFile(fileName, 'utf8');
        const html = cheerio.load(fileContent);
        if (this.authorizationChecker.isAuthorized(currentUser, html, teams)) {
            logger.info(`${currentUser.email} authorized to see ${fileName}`);
            return this.filterfeatures(html, currentUser)
        } else {
            return null;
        }
    }

    filterfeatures(html, currentUser) {
        const types = ['roles','team'];
        const dataAuthString = types.map( type=>`[data-auth-${type}]`);
        const feature = html( dataAuthString.join() , 'body');
        
        feature.map( (i,f) => {
            const dataAuth = Object.keys(f.attribs).find(a=>a.startsWith('data-auth-'))
            const type = dataAuth.split('-').pop();
            const attr = html(f).attr(`data-auth-${type}`)
            if( !this.authorizationChecker.isFeatureAuthorised( currentUser, type, attr.split() )) {
                logger.info(`-- ${currentUser.email} not authorized to see feature : ${html(f).attr(`data-title`)}`);
                html(f).remove();
            }
        })
        
        return html.html();
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