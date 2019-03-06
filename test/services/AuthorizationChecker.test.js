import AuthorizationChecker from "../../src/services/AuthorizationChecker";
import expect from "expect";
import fs from "fs";
import path from 'path';
import cheerio from "cheerio";

describe('Authorization Checker', () => {
    const authorizationChecker = new AuthorizationChecker();
    const currentUser = {
        "teamid" : "teamid",
        "commandid" : "commandid",
        "subcommandid": "subcommandid",
        "locationid" : "locationid"
    };
    it('is authorised by team id', () => {
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
    it ('displays report if matched on commandid', () => {
        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-commandid.html'), 'utf8');
        const html = cheerio.load(file);
        const authorized = authorizationChecker.isAuthorized(currentUser, html);
        expect(authorized).toEqual(true);
    });
    it ('displays report if matched on subcommandid', () => {
        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-subcommandid.html'), 'utf8');
        const html = cheerio.load(file);
        const authorized = authorizationChecker.isAuthorized(currentUser, html);
        expect(authorized).toEqual(true);
    });
    it ('displays report if matched on locationid', () => {
        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-locationid.html'), 'utf8');
        const html = cheerio.load(file);
        const authorized = authorizationChecker.isAuthorized(currentUser, html);
        expect(authorized).toEqual(true);
    });
    it ('is authorised by team code', () => {
        const teamUser = {
            "teamid" : "12345"
        };
        const teams = [
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
            },

        ]
        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-4.html'), 'utf8');
        const html = cheerio.load(file);

        const authorized = authorizationChecker.isAuthorized(teamUser, html, teams);
        expect(authorized).toEqual(true);

    })
    it ('is not authorised by team code', () => {
        const teamUser = {
            "teamid" : "12345"
        };
        const teams = [
            {
                teamid : "67890",
                teamcode : "COP"
            }
        ]
        const file =  fs.readFileSync(path.join(__dirname, '../reports/test-report-4.html'), 'utf8');
        const html = cheerio.load(file);

        let authorized = authorizationChecker.isAuthorized(teamUser, html, teams);
        expect(authorized).toEqual(false);

        authorized = authorizationChecker.isAuthorized(teamUser, html, []);
        expect(authorized).toEqual(false);

    })


});