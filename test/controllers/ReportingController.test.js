import ReportService from "../../src/services/ReportService";
import ReportingController from "../../src/controllers/ReportingController";
import path from 'path';
import expect from 'expect';

process.env.WHITE_LISTED_DOMAIN = 'http://localhost:8000';

import httpMocks from 'node-mocks-http';
import AuthorizationChecker from "../../src/services/AuthorizationChecker";
import PlatformDataService from "../../src/services/PlatformDataService";
import * as sinon from "sinon";

const testConfig = {
    reportsDir: path.join(__dirname, '../reports'),
    baseUrl: `localhost:8000`,
    services: {
        platformData: {
            url: 'http://localhost:9000'
        }
    },
    cors: {
        origin: 'http://localhost:8080'
    }
};

describe('Reporting Controller', () => {
    let controller;
    let authorizationChecker = new AuthorizationChecker();
    let platformDataService;
    let currentUser;

    beforeEach(() => {
        platformDataService = sinon.createStubInstance(PlatformDataService);
        controller = new ReportingController(new ReportService(testConfig, authorizationChecker), testConfig,
            platformDataService);
        currentUser = {
            shiftid: 'shiftid',
            email: 'email',
            roles: [
                "role1",
                "role2"
            ],
            team: {
                code: "COP_ADMIN",
                id: "12345"
            }
        }
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
        const shiftInfo = platformDataService.currentUserShift.resolves(currentUser);

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
        const shiftInfo = platformDataService.currentUserShift.resolves(currentUser);

        controller.listReports(request, response);
        response.on('end', () => {
            sinon.assert.calledOnce(shiftInfo);
            expect(response.statusCode).toEqual(200);
            expect(response._isEndCalled()).toBe(true);
            const data = JSON.parse(response._getData());
            expect(data.length).toBeGreaterThanOrEqual(1);
            done();
        });
    });
    it('throws unauthorized on get report', (done) => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/reports/test-report.html',
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
        controller.getReport(request, response);
        response.on('end', () => {
            sinon.assert.calledOnce(shiftInfo);
            expect(response.statusCode).toEqual(404);
            done();
        });
    });
    it('can get report', (done) => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/reports',
            params: {
                reportName: "test-report.html"
            },
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
        const shiftInfo = platformDataService.currentUserShift.resolves(currentUser);
        const res = {
             header: (options) => {
                 console.log('options '+ JSON.stringify(options));
             },
             status: (code, options) => {
                function send (file){
                    console.log(`Returning file${file}`);
                    return file;
                }
                return {send}
             }
        };
        controller.getReport(request, res).then(() => {
            sinon.assert.calledOnce(shiftInfo);
            done();
        });


    });
});
