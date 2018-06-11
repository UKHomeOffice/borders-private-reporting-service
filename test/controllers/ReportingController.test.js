import ReportService from "../../src/services/ReportService";
import ReportingController from "../../src/controllers/ReportingController";
import path from 'path';
import expect from 'expect';

process.env.WHITE_LISTED_DOMAIN = 'http://localhost:8000';

import httpMocks from 'node-mocks-http';

const testConfig = () => {
    return {
        reportsDir: path.join(__dirname, '../reports')
    }
};

describe('Reporting Controller', () => {
    let controller;
    beforeEach(() => {
        controller = new ReportingController(new ReportService(testConfig()), testConfig());
    });
    it('can load reports', (done) => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/api/reports',
        });
        const response = httpMocks.createResponse({
            eventEmitter: require('events').EventEmitter
        });

        controller.listReports(request, response);
        response.on('end', () => {
            expect(response.statusCode).toEqual(200);
            expect(response._isEndCalled()).toBe(true);
            const data = JSON.parse(response._getData());
            expect(data.length).toBe(1);
            done();
        });
    });
});