var WondrousActions = require('../actions/WondrousActions');
var WondrousConstants = require('../constants/WondrousConstants');
var WondrousAPI = require('../utils/WondrousAPI');

var defaultUser = {};

var UserStore = Reflux.createStore({
    listenables: WondrousActions,

    init: function() {
        this.user = defaultUser;
        this.loaded = false;
        this.loggedIn = false;

        WondrousActions.auth();
    },

    updateUser: function(userData) {
        this.user = userData;
        this.loggedIn = true;
        this.loaded = true;
        this.trigger({user:this.user});
    },

    unloadUser: function() {
        this.user = {};

        this.trigger({user:this.user});
    },

    notLoggedIn: function() {
        this.loggedIn = false;
        this.loaded = true;
        this.trigger({user:this.user});
    }



});

module.exports = UserStore;
