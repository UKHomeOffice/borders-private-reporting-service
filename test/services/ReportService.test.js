import ReportingService from '../../src/services/ReportService';
import AuthorizationChecker from '../../src/services/AuthorizationChecker';
import expect from "expect";
import fs from "fs";
import path from 'path';
import cheerio from "cheerio";

describe('Reporting Service', () => {
    let ac, rs, currentUser, teams;
    const config = {
        reportsDir:'test/reports'
    }

    function removeWhiteSpace(string){
        return string.replace(/\s{2,}|\n|\r|\t/g, '');
    }

    beforeEach(()=>{
        ac = new AuthorizationChecker()
        rs = new ReportingService( config, ac );

        currentUser = {
            email : 'test.developer@homeoffice.gov.uk',
            teamid : "67890",
            roles : ['contractor','copge']
        }

        teams = [
            {
                teamid : "12345",
                teamcode : "OSCT"
            },
            {
                teamid : "67890",
                teamcode : "COP_ADMIN"
            },
            {
                teamid : "54321",
                teamcode : "HOB"
            }
        ]
    })

    it('should return the content if authorised', async () => {

        const report = await rs.report('test-report.html', currentUser, teams);

        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report.html'), 'utf8');
        const html = cheerio.load(file);

        expect(report).not.toBe(null);
        expect(report).toEqual(html.html());
    })

    it('should not return the content if unauthorised', async () => {
        const report = await rs.report('test-report-2.html', currentUser, teams);
        expect(report).toBe(null);
    })

    it('should show authorised features', async () => {

        const report = await rs.report('test-report-5.html', currentUser, teams);

        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-5.html'), 'utf8');
        const html = cheerio.load(file);

        expect(report).not.toBe(null);
        expect(report).toEqual(html.html());

    })

    it('should hide unauthorised features', async () => {

        const report = await rs.report('test-report-6.html', currentUser, teams);
        const html = cheerio.load('<html><meta name="title" content="test report"><meta name="team" content="COP_ADMIN,OSCT,HOB"><body></div></body></html>');
        expect(report).not.toBe(null);
        expect(removeWhiteSpace(report)).toEqual(html.html());

    })

    it('should show authorised and hide unauthorised features', async () => {
        const report = await rs.report('test-report-7.html', currentUser, teams);
        const html = cheerio.load('<html><meta name="title" content="test report"><meta name="team" content="COP_ADMIN,OSCT,HOB"><body><div data-auth-roles="contractor" data-title="Download Button 1"><a href="#">Download Button 1</a></div></body></html>');
        
        expect(report).not.toBe(null);
        expect(removeWhiteSpace(report)).toEqual(html.html())
    })

    it('should show all features if no data-auth attributes defined', async () => {
        const report = await rs.report('test-report-8.html', currentUser, teams);

        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-8.html'), 'utf8');
        const html = cheerio.load(file);

        expect(report).not.toBe(null);
        expect(report).toEqual(html.html());
    })
})