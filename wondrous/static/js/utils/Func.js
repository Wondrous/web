var UserStore = require('../stores/UserStore');
var WondrousActions = require('../actions/WondrousActions');

module.exports = {
    checkLogin:function(){
        if(!UserStore.loggedIn){
            WondrousActions.openSignupPrompt();
            return false;
        }
        return true;
    }
}
