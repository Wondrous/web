var WondrousActions = require('../actions/WondrousActions');
var WondrousConstants = require('../constants/WondrousConstants');

var SettingStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.sidebarOpen = false;
        this.sidebarType = null;
        this.pageType = null;
    },

    unloadUser: function(){
        this.sidebarOpen = false;
        this.sidebarType = null;
        this.pageType = null;
        this.trigger();
    },

    toggleSideBar:function() {
        this.sidebarOpen = !this.sidebarOpen;
        if(!this.sidebarOpen) {
            this.sidebarType = null;
        }
        this.trigger();
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


module.exports = SettingStore;
