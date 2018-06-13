import ReportService from "../../src/services/ReportService";
import ReportingController from "../../src/controllers/ReportingController";
import path from 'path';
import expect from 'expect';

process.env.WHITE_LISTED_DOMAIN = 'http://localhost:8000';
process.env.PLATFORM_DATA_PROXY_URL = 'http://localhost:9000';

import httpMocks from 'node-mocks-http';
import AuthorizationChecker from "../../src/services/AuthorizationChecker";
import PlatformDataService from "../../src/services/PlatformDataService";
import * as sinon from "sinon";

const testConfig = () => {
    return {
        reportsDir: path.join(__dirname, '../reports'),
        baseUrl: `localhost:8000`
    }
};

describe('Reporting Controller', () => {
    let controller;
    let authorizationChecker = new AuthorizationChecker();
    let platformDataService;
    beforeEach(() => {
        platformDataService = sinon.createStubInstance(PlatformDataService);
        controller = new ReportingController(new ReportService(testConfig(), authorizationChecker), testConfig(),
            platformDataService);
    });
    it('not authorized response if user is not in shift', (done) => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/reports',
            protocol: 'http',
            kauth: {
                grant: {
                    access_token: {
                        token: "test-token",
                        content: {
                            session_state: "session_id",
                            email: "email",
                            preferred_username: "test",
                            given_name: "testgivenname",
                            family_name: "testfamilyname"
                        }
                    }

                }
            }
        });
        const response = httpMocks.createResponse({
            eventEmitter: require('events').EventEmitter
        });
        const shiftInfo = platformDataService.currentUserShift.resolves(null);

        controller.listReports(request, response);
        response.on('end', () => {
            sinon.assert.calledOnce(shiftInfo);
            expect(response.statusCode).toEqual(404);
            done();
        });
    });
    it('can load reports', (done) => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/reports',
            protocol: 'http',
            kauth: {
                grant: {
                    access_token: {
                        token: "test-token",
                        content: {
                            session_state: "session_id",
                            email: "email",
                            preferred_username: "test",
                            given_name: "testgivenname",
                            family_name: "testfamilyname"
                        }
                    }

                }
            }
        });
        const response = httpMocks.createResponse({
            eventEmitter: require('events').EventEmitter
        });
        const shiftInfo = platformDataService.currentUserShift.resolves({"teamid": "teamid", "email": "email"});

        controller.listReports(request, response);
        response.on('end', () => {
            sinon.assert.calledOnce(shiftInfo);
            expect(response.statusCode).toEqual(200);
            expect(response._isEndCalled()).toBe(true);
            done();
        });
    });
    it('filtered reports based on users shift info', (done) => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/reports',
            protocol: 'http',
            kauth: {
                grant: {
                    access_token: {
                        token: "test-token",
                        content: {
                            session_state: "session_id",
                            email: "email",
                            preferred_username: "test",
                            given_name: "testgivenname",
                            family_name: "testfamilyname"
                        }
                    }

                }
            }
        });
        const response = httpMocks.createResponse({
            eventEmitter: require('events').EventEmitter
        });
        const shiftInfo = platformDataService.currentUserShift.resolves({"teamid": "teamid", "email": "email"});

        controller.listReports(request, response);
        response.on('end', () => {
            sinon.assert.calledOnce(shiftInfo);
            expect(response.statusCode).toEqual(200);
            expect(response._isEndCalled()).toBe(true);
            const data = JSON.parse(response._getData());
            expect(data.length).toBeGreaterThanOrEqual(1);
            done();
        });
    })
});