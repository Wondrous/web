var WondrousActions = require('../actions/WondrousActions');
var WondrousConstants = require('../constants/WondrousConstants');
var NotificationStore = require('./NotificationStore');
var ModalStore = require('./ModalStore');

var SettingStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.sidebarOpen = false;
        this.sidebarType = null;
        this.pageType = null;
        this.uploading = false;

        window.onbeforeunload = this.handleBeforeUnload;
        window.onUnload = this.handleUnload
    },

    handleUnload: function(){
        if(NotificationStore.subscribed){
            NotificationStore.pushstream.disconnect();
        }
    },

    handleBeforeUnload: function(){
        if(ModalStore.postFormOpen||ModalStore.pictureFormOpen||this.uploading){
            return "Are you sure you want to leave?"
        }
    },

    unloadUser: function(){
        this.sidebarOpen = false;
        this.sidebarType = null;
        this.pageType = null;
        this.uploading = false;
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
    },

    searchLoaded: function(){
        this.pageType = WondrousConstants.SEARCH_PAGE;
    }

});


module.exports = SettingStore;
