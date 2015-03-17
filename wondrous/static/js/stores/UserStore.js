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

        this.sidebarOpen = false;
        this.sidebarType = null;
        this.pageType = null;
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
        this.loggedIn = false;
        this.sidebarOpen = false;

        this.sidebarType = null;
        this.modalType = null;
        this.trigger({user:this.user});
    },

    notLoggedIn: function() {
        this.loggedIn = false;
        this.loaded = true;
        this.trigger({user:this.user});
    },

    toggleSideBar:function() {
        this.sidebarOpen = !this.sidebarOpen;
        if(!this.sidebarOpen) {
            this.sidebarType = null;
        }
    },

    toggleSettings: function() {
        this.sidebarType = WondrousConstants.SHOW_SETTINGS;
        this.toggleSideBar();
        this.trigger({sidebarType:this.sidebarType});
    },

    toggleNotifications: function() {
        this.sidebarType = WondrousConstants.SHOW_NOTIFICATIONS;
        this.toggleSideBar();
        this.trigger({sidebarType:this.sidebarType});
    },

    wallLoaded: function() {
        this.pageType = WondrousConstants.PROFILE_PAGE;
    },

    feedLoaded: function() {
        this.pageType = WondrousConstants.FEED_PAGE;
    }

});

module.exports = UserStore;
