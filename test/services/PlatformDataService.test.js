import PlatformDataService from "../../src/services/PlatformDataService";

import nock from "nock";
import expect from "expect";
import path from "path";


describe('PlatformDataService', () => {
    const config = {
        reportsDir : path.join(__dirname, '../reports'),
        services: {
            platformData: {
                url: 'http://localhost:9001'
            }
        }
    }
    const platformDataService = new PlatformDataService(config);

    const SHIFT_API_URL = '/v1/shift?email=eq.email';
    const TEAM_API_URL = '/v1/team?id=eq.12345';

    it('can get shift details', (done) => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get(SHIFT_API_URL)
            .reply(200, [
                {
                    shiftid: 'shiftid',
                    email: 'email',
                    roles: [
                        "role1",
                        "role2"
                    ],
                    teamid: "12345"
                }
            ]);
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get(TEAM_API_URL)
            .reply(200, [
                {
                    id: "12345",
                    code: "COP_ADMIN"
                }
            ]);

        platformDataService.currentUserShift("email").then((shift) =>{
            expect(shift.shiftid).toEqual("shiftid");
            expect(shift.email).toEqual("email");
            expect(shift.roles).toEqual(["role1","role2"]);
            expect(shift.team).toEqual({code: "COP_ADMIN",id: "12345"})
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('does not return user if REST endpoint returns error', (done) => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
            .get(SHIFT_API_URL)
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
            .get(SHIFT_API_URL)
            .reply(200, []);
        platformDataService.currentUserShift("email").then((shift) => {
            expect(shift).toEqual(undefined);
            done();
        }).catch((err) => {
            done(err);
        });
    });

  it('can get team details', done => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
        .get(TEAM_API_URL)
        .reply(200, [
            {
                id: "12345",
                code: "COP_ADMIN"
            }
        ]);

      platformDataService.teamById("12345", "token")
        .then(team => {
          expect(team).toEqual({id: "12345", code: "COP_ADMIN"});
          done();
        }).catch(err => {
          done(err);
        });
  });
  it('returns no team details on error', done => {
        nock('http://localhost:9001/', {
            'Authorization': 'Bearer token'
        }).log(console.log)
        .get(TEAM_API_URL)
        .reply(504, []);

      platformDataService.teamById("12345", "token")
        .then(team => {
          expect(team).toEqual(null);
          done();
        }).catch(err => {
          done(err);
        });
  });
});
