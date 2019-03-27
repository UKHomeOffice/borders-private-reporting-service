import ReportingService from '../../src/services/ReportService';
import AuthorizationChecker from '../../src/services/AuthorizationChecker';
import expect from "expect";
import fs from "fs";
import path from 'path';
import cheerio from "cheerio";

describe('Reporting Service', () => {
    let ac, rs, currentUser;
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
            team : {
                teamid : "67890",
                teamcode : 'COP_ADMIN'
            },
            roles : ['contractor','copge']
        }
    })

    it('should return the content if authorised', async () => {

        const report = await rs.report('test-report.html', currentUser);

        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report.html'), 'utf8');
        const html = cheerio.load(file);

        expect(report).not.toBe(null);
        expect(report).toEqual(html.html());
    })

    it('should not return the content if unauthorised', async () => {
        const report = await rs.report('test-report-2.html', currentUser);
        expect(report).toBe(null);
    })

    it('should show authorised features', async () => {

        const report = await rs.report('test-report-5.html', currentUser);

        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-5.html'), 'utf8');
        const html = cheerio.load(file);

        expect(report).not.toBe(null);
        expect(report).toEqual(html.html());

    })

    it('should hide unauthorised features', async () => {

        const report = await rs.report('test-report-6.html', currentUser);
        const html = cheerio.load('<html><meta name="title" content="test report"><meta name="team" content="COP_ADMIN,OSCT,HOB"><body></div></body></html>');
        expect(report).not.toBe(null);
        expect(removeWhiteSpace(report)).toEqual(html.html());

    })

    it('should show authorised and hide unauthorised features', async () => {
        const report = await rs.report('test-report-7.html', currentUser);
        const html = cheerio.load('<html><meta name="title" content="test report"><meta name="team" content="COP_ADMIN,OSCT,HOB"><body><div data-auth-roles="contractor" data-title="Download Button 1"><a href="#">Download Button 1</a></div></body></html>');
        
        expect(report).not.toBe(null);
        expect(removeWhiteSpace(report)).toEqual(html.html())
    })

    it('should show all features if no data-auth attributes defined', async () => {
        const report = await rs.report('test-report-8.html', currentUser);

        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-8.html'), 'utf8');
        const html = cheerio.load(file);

        expect(report).not.toBe(null);
        expect(report).toEqual(html.html());
    })
})