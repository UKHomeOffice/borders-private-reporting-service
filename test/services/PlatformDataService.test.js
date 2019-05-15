import PlatformDataService from "../../src/services/PlatformDataService";

import nock from "nock";
import expect from "expect";
import path from "path";


describe('PlatformDataService', () => {
    const config = {
        reportsDir : path.join(__dirname, '../reports'),
        services: {
            operationalData: {
                url: 'http://localhost:9001'
            }
        }
    }
    const platformDataService = new PlatformDataService(config);

    const API_URL = '/shift?email=eq.email&select=email,team(teamcode,teamid),roles';

    it('can get shift details', (done) => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get(API_URL)
            .reply(200, [
                {
                    shiftid: 'shiftid',
                    email: 'email',
                    roles: [
                        "role1",
                        "role2"
                    ],
                    team: {
                        teamcode: "COP_ADMIN",
                        teamid: "12345"
                    }
                }
            ]);

        platformDataService.currentUserShift("email").then((shift) =>{
            expect(shift.shiftid).toEqual("shiftid");
            expect(shift.email).toEqual("email");
            expect(shift.roles).toEqual(["role1","role2"]);
            expect(shift.team).toEqual({teamcode: "COP_ADMIN",teamid: "12345"})
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('does not return user if REST endpoint returns error', (done) => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get(API_URL)
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
            .get(API_URL)
            .reply(200, []);
        platformDataService.currentUserShift("email").then((shift) => {
            expect(shift).toEqual(undefined);
            done();
        }).catch((err) => {
            done(err);
        });
    });

});