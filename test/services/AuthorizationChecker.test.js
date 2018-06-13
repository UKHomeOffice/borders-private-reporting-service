import AuthorizationChecker from "../../src/services/AuthorizationChecker";
import expect from "expect";
import fs from "fs";
import path from 'path';
import cheerio from "cheerio";

describe('Authorization Checker', () => {
    const authorizationChecker = new AuthorizationChecker();
    const currentUser = {
        "teamid" : "teamid"
    };
    it('is authorised', () => {
        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report.html'), 'utf8');
        const html = cheerio.load(file);
        const authorized = authorizationChecker.isAuthorized(currentUser, html);
        expect(authorized).toEqual(true);
    });
    it('is not authorised', () => {
        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-2.html'), 'utf8');
        const html = cheerio.load(file);
        const authorized = authorizationChecker.isAuthorized(currentUser, html);
        expect(authorized).toEqual(false);
    });
    it('is authorized to see as no restrictions defined', () => {
        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-3.html'), 'utf8');
        const html = cheerio.load(file);
        const authorized = authorizationChecker.isAuthorized(currentUser, html);
        expect(authorized).toEqual(true);
    });
});