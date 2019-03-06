class AuthorizationChecker {
    constructor() {
        this.isAuthorized = this.isAuthorized.bind(this);
    }

    isAuthorized(currentUser, html, teams) {
        const {command, subcommand, team, location} = this.details(html);

        if (this.isToBeSeenByAll({command, subcommand, team, location})) {
            return true;
        }
        if (command.filter((c => currentUser['commandid'] === c)).length >= 1) {
            return true;
        } else if (subcommand.filter((c => currentUser['subcommandid'] === c)).length >= 1) {
            return true
        } else if (team.filter(c => {
            return teams && teams.length ? this.getTeamId(c, teams) === currentUser['teamid'] : false;
        }).length >= 1) {
            return true;
        } else return location.filter((c => currentUser['locationid'] === c)).length >= 1;
    }

    getTeamId(code, teams) {
        const team = teams.find( t => t.teamcode === code );
        return team ? team.teamid : '';
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