import PlatformDataService from "../../src/services/PlatformDataService";

process.env.PLATFORM_DATA_PROXY_URL = 'http://localhost:9001';
import nock from "nock";
import expect from "expect";
import configConstants from "../../src/utilities/configConstants";


describe('PlatformDataService', () => {

    const platformDataService = new PlatformDataService(configConstants());

    it('can get shift details', (done) => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get('/api/platform-data/shift?email=eq.email')
            .reply(200, [
                {
                    shiftid: 'shiftid',
                    email: 'email'
                }
            ]);

        platformDataService.currentUserShift("email").then((shift) =>{
            expect(shift.shiftid).toEqual("shiftid");
            expect(shift.email).toEqual("email");
            done();
        }).catch((err) => {
            done(err);
        });
    });
    it('does not return user if REST endpoint returns error', (done) => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get('/api/platform-data/shift?email=eq.email')
            .reply(504, []);
        platformDataService.currentUserShift("email").then((shift) => {
            expect(shift).toEqual(null);
            done();
        }).catch((err) => {
            done(err);
        });
    });
    it('does not return user if REST endpoint returns empty', (done) => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get('/api/platform-data/shift?email=eq.email')
            .reply(200, []);
        platformDataService.currentUserShift("email").then((shift) => {
            expect(shift).toEqual(undefined);
            done();
        }).catch((err) => {
            done(err);
        });
    });
    it ('can get team details', () => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get('/api/platform-data/team')
            .reply(200, [
                {
                    teamid: 'teamid',
                    teamcode: 'teamcode'
                }
            ]);

            platformDataService.getTeams("token").then((teams) =>{
            expect(teams.length).to.equal(1);
            expect(teams[0]['teamcode']).to.equal("teamcode");
            expect(teams[0]['teamid']).to.equal("teamid");
            done();
        }).catch((err) => {
            done(err);
        });
    })

    it('does not return teams if REST endpoint returns error', (done) => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get('/api/platform-data/team')
            .reply(504, []);
        platformDataService.getTeams("token").then((teams) => {
            expect(teams).toEqual(null);
            done();
        }).catch((err) => {
            done(err);
        });
    });
    it('does not return teams if REST endpoint returns empty', (done) => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get('/api/platform-data/team')
            .reply(200, []);
        platformDataService.getTeams("token").then((teams) => {
            expect(teams).toEqual([]);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});