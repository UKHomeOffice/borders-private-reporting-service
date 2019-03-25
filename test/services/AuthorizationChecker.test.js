import AuthorizationChecker from "../../src/services/AuthorizationChecker";
import expect from "expect";
import fs from "fs";
import path from 'path';
import cheerio from "cheerio";

describe('Authorization Checker', () => {
    let validShift, authorizationChecker
        
    beforeEach(()=>{
        authorizationChecker = new AuthorizationChecker();
        validShift = {
            email : 'test.developer@homeoffice.gov.uk',
            roles:['contractor'],
            location : {
                name : 'Apollo House'
            },
            team : {
                teamcode : 'COP_ADMIN',
                ministry: {
                    name: "Home Office"
                },
                department: {
                    name: "Border Force"
                },
                directorate: {
                    name: "Border Systems"
                },
                branch: {
                    name: "Architecture and Engineering"
                },
                division: {
                    name : "South East"
                },
                command: {
                    name : "London Gateway"
                }
            }
        }
    })

    const types = [
        {name: 'roles', valid : 'contractor', invalid: {roles : ['X']}, empty: {roles : ['']}},
        {name: 'team', valid: 'COP_ADMIN', prop : 'teamcode'},
        {name: 'ministry', valid : 'Home Office'},
        {name: 'directorate', valid: 'Border Systems'},
        {name: 'department', valid: 'Border Force'},
        {name: 'branch', valid: 'Architecture and Engineering'},
        {name: 'command', valid: 'London Gateway'},
        {name: 'division', valid: 'South East'},
        {name: 'location', valid : 'Apollo House, Croydon', invalid : { location : { name: 'X'} }, empty: { location : { name :''}}}
    ]
        
        types.forEach( type => {

            it( `is authorised to view report by ${type.name}` , () => {
                const html = cheerio.load(`<html><meta name="${type.name}" content="${type.valid}"><body></body></html>`);

                if(!type.invalid){
                    type.invalid = { team : { ...validShift.team, [type.prop||type.name] : { name : 'X'}}}
                }

                if(!type.empty){
                    type.empty = { team : { ...validShift.team, [type.prop||type.name] : { name : ''}}}
                }

                const invalid = Object.assign({}, validShift, type.invalid)
                const empty   = Object.assign({}, validShift, type.empty)

                expect(authorizationChecker.isAuthorized(validShift, html)).toEqual(true);
                expect(authorizationChecker.isAuthorized(invalid, html)).toEqual(false);
                expect(authorizationChecker.isAuthorized(empty, html)).toEqual(false);
            })

        })
 
        types.slice(1).forEach( type => {
            it( `is authorised to view report by role > ${type.name}`, () => {
                const html = cheerio.load(`<html><meta name="${type.name}" content="${type.valid}"><meta name="roles" content="contractor"><body></body></html>`);
                expect(authorizationChecker.isAuthorized(validShift, html)).toEqual(true);
            }) 
        })

        it( `is authorised to view report if no defined meta data`, () => {
            const html = cheerio.load(`<html><body></body></html>`);
            expect(authorizationChecker.isAuthorized(validShift, html)).toEqual(true);
        })

        it( `is authorised to view report - ignores invalid meta data`, () => {
            const html = cheerio.load(`<html><meta name="X" content="X"><body></body></html>`);
            expect(authorizationChecker.isAuthorized(validShift, html)).toEqual(true);
        })

        it( `is authorised to view report if multiple roles`, () => {
            const html = cheerio.load(`<html><meta name="roles" content="contractor,copge"><body></body></html>`);
            expect(authorizationChecker.isAuthorized(validShift, html)).toEqual(true);
        })

        it( `is authorised to view report if invalid role with valid team`, () => {
            const html = cheerio.load(`<html><meta name="roles" content="invalid role"><meta name="team" content="COP,COP_ADMIN"><body></body></html>`);
            expect(authorizationChecker.isAuthorized(validShift, html)).toEqual(false);
        }) 


    //})


});