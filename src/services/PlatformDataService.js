import * as logger from 'winston';
import axios from "axios";

class PlatformDataService {

    constructor(config) {
        this.config = config;
        this.currentUserShift = this.currentUserShift.bind(this);
        this.getTeams = this.getTeams.bind(this);
    }

    async currentUserShift(email, token) {
        try {
            const response = await axios({
                url: `${this.config.platformDataProxyUrl}/api/platform-data/shift?email=eq.${encodeURIComponent(email)}`,
                method: 'GET',
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}`
                }
            });
            const shiftDetails = response.data ? response.data[0] : null;
            logger.info(`Shift details ${JSON.stringify(shiftDetails)}`);
            return shiftDetails;
        } catch (err) {
            logger.error(`Failed to get shift details ${err.toString()}`);
            return null;
        }
    }

    async getTeams(token) {
        try {
            const response = await axios.get(
                `${this.config.platformDataProxyUrl}/api/platform-data/team`,
                {
                    headers: {
                        'Content-Type' : 'application/json',
                        'Authorization' : `Bearer ${token}`
                    }
                })
                const teams = response.data;
                logger.info(`Team details ${JSON.stringify(teams)}`);
                return teams;
            
        } catch (err) {
            logger.error(`Failed to get team details ${err.toString()}`);
            return null
        }
    }
}

export default PlatformDataService;