import ReportService from '../../src/services/ReportService';
import expect from "expect";
import AuthorizationChecker from '../../src/services/AuthorizationChecker';
import fs from "fs";
import path from 'path';
import cheerio from "cheerio";

describe('ReportService', () => {
    const authorisedReports = [1,2,3,6,7,8];
    const unauthorisedReports = [4,5,9];
    let config, ac, rs, currentUser;

    beforeEach(()=>{
        config  = {
            reportsDir : 'test/reports/reportslist'
        }
        ac = new AuthorizationChecker();
        rs = new ReportService(config, ac);
        currentUser = {
            email : 'test.developer@homeoffice.gov.uk',
            roles:['contractor'],
            location : {
                name : 'Apollo House'
            },
            team : {
                teamcode : 'COP_ADMIN',
                ministry: {
                    name: "Home Office"
                },
                department: {
                    name: "Border Force"
                },
                directorate: {
                    name: "Border Systems"
                },
                branch: {
                    name: "Architecture and Engineering"
                },
                division: {
                    name : "South East"
                },
                command: {
                    name : "London Gateway"
                }
            }
        }
    })

    authorisedReports.forEach( id => {
        it('should return the requested report based on valid authorisation', async () => {
            const report = await rs.report(`test-report-${id}.html`, currentUser);
            const file = fs.readFileSync(path.join(__dirname, `../reports/reportslist/test-report-${id}.html`), 'utf8');
            const html = cheerio.load(file);
            expect(report.html()).toEqual(html.html());
        })
    })

    unauthorisedReports.forEach( id => {
        it('should not return the requested report based on invalid authorisation', async () => {
            const report = await rs.report(`test-report-${id}.html`, currentUser);
            const file = fs.readFileSync(path.join(__dirname, `../reports/reportslist/test-report-${id}.html`), 'utf8');
            const html = cheerio.load(file);
            expect(report).toEqual(null);
        })
    })

    it('should return the expected list of reports based on authorisation', async () => {
        
        const reports = await rs.reports(currentUser);
        
        const reportsList = authorisedReports.map( i => {
            return {
                name : `Test Report ${i} title`,
                description: `Test Report ${i} description`,
                htmlName : `test-report-${i}.html`
            }
        }).concat(unauthorisedReports.map(r=>null));
        
        expect(reports.length).toEqual(reportsList.length);
        expect(reports.sort()).toEqual(reportsList.sort());


    })
})