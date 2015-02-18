var AppDispatcher = require('../dispatcher/AppDispatcher');
var WondrousConstants = require('../constants/WondrousConstants');

// Define actions object
var WondrousActions = {

    // Receive a post to add to feed
    addToFeed: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.POST_RECEIVE,
            data: data
        });
    },

    // Load an array of posts to feed
    loadToFeed: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.FEED_LOAD,
            data: data
        });
    },

    // An user logged in
    loadUserInfo: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.USER_LOAD,
            data: data
        });
    },

    // An user profile loaded
    loadProfileInfo: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.PROFILE_LOAD,
            data: data
        });
    },

    // An user wall loaded
    loadWallPosts: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.WALL_LOAD,
            data: data
        });
    },

    // An user logs out
    unloadUserInfo: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.USER_UNLOAD,
            data: data
        });
    },

    // toggles the sidebar
    toggleSideBar: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.TOGGLE_SIDEBAR,
            data: data
        });
    }
}

module.exports = WondrousActions
