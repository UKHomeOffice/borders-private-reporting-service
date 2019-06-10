import _ from 'lodash';

class AuthorizationChecker {
    constructor() {
        this.isAuthorized = this.isAuthorized.bind(this);
        this.isFeatureAuthorised = this.isFeatureAuthorised.bind(this);
    }

    isAuthorized(currentUser, html) {
        const {command, subcommand, team, location} = this.details(html);

        if (this.isToBeSeenByAll({command, subcommand, team, location})) {
            return true;
        }
        if (command.filter((c => currentUser['commandid'] === c)).length >= 1) {
            return true;
        } else if (subcommand.filter((c => currentUser['subcommandid'] === c)).length >= 1) {
            return true
        } else if (team.filter(c => currentUser['team']['code'] === c).length >= 1) {
            return true;
        } else return location.filter((c => currentUser['locationid'] === c)).length >= 1;
    }

    isFeatureAuthorised(currentUser,type, auth) {
        if(type === 'roles') {
            return auth.filter(c=>currentUser.roles.includes(c)).length > 0
        } else {
            return this.checkAuthorisation(auth,this.getTypePath(type), currentUser);
        }
    }

    checkAuthorisation(type, path, currentUser) {
        return type.filter(c => _.get(currentUser,path,'') === c).length > 0;
    }

    getTypePath(type) {
        const typeMap = {
            team : 'team.code'
        }
        return typeMap[type];
    }

    hasContent(object) {
        return object.length !== 0;
    }

    details(html) {
        const command = html("meta[name='command']").attr("content") ? html("meta[name='command']").attr("content").split(',') : [];
        const subcommand = html("meta[name='subcommand']").attr("content") ? html("meta[name='subcommand']").attr("content").split(',') : [];
        const team = html("meta[name='team']").attr("content") ? html("meta[name='team']").attr("content").split(',') : [];
        const location = html("meta[name='location']").attr("content") ? html("meta[name='location']").attr("content").split(',') : [];
        return {
            command,
            subcommand,
            team,
            location
        }
    }

    isToBeSeenByAll({command, subcommand, team, location}) {
      return !this.hasContent(command)
          && !this.hasContent(subcommand)
          && !this.hasContent(team)
          && !this.hasContent(location)
    }

}

export default AuthorizationChecker;
