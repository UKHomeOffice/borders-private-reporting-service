import _ from 'lodash';

class AuthorizationChecker {
    constructor() {
        this.isAuthorized = this.isAuthorized.bind(this);
    }

    isAuthorized(currentUser, html) {
        const details = this.details(html);
        const {ministry, directorate, department, branch, command, division, location, team, roles} = details;
        
        //if no meta data set, authorisation granted
        if(_.every(details, c=>c.length===0) ) { return true;}

        if(roles.filter(c => currentUser.roles.includes(c)).length > 0 ){return true;}
        if(this.checkAuthorisation(team,'team.teamcode',currentUser)) {return true;}
        if(this.checkAuthorisation(location,'location.name',currentUser)) {return true;}
        if(this.checkAuthorisation(division,'team.division.name',currentUser)) {return true;}
        if(this.checkAuthorisation(command,'team.command.name',currentUser)) {return true;}
        if(this.checkAuthorisation(branch,'team.branch.name',currentUser)) {return true;}
        if(this.checkAuthorisation(department,'team.department.name',currentUser)) {return true;}
        if(this.checkAuthorisation(directorate,'team.directorate.name',currentUser)) {return true;}
        if(this.checkAuthorisation(ministry,'team.ministry.name',currentUser)) {return true;}

        return false
        
    }

    checkAuthorisation(type, path, currentUser) {
        return type.filter(c => _.get(currentUser,path,'') === c).length > 0;
    }

    details(html) {
        return Object.assign({},
        ...['ministry','directorate','department','branch','command','division','location','team', 'roles']
        .map( v => {
            const meta = html(`meta[name='${v}']`).attr(`content`);
            return{ [v] : meta ? this.format(meta).split(',') : [] };
        }))
    }

    format(value) {
        return value.search(',') > 0 ? value.slice(0,value.indexOf(',')) : value;
    }

}

export default AuthorizationChecker;