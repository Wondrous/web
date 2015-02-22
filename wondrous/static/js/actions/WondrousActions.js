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

    // Load Notifications
    loadUserNotification: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.NOTIFICATION_LOAD,
            data:data
        });
    },

    // An user profile loaded
    loadProfileInfo: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.PROFILE_LOAD,
            data: data
        });
    },

    // An user's followers are loaded
    loadProfileFollower: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.FOLLOWER_LOAD,
            data: data
        });
    },

    // An user's following are loaded
    loadProfileFollowing: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.FOLLOWING_LOAD,
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

    // toggles the settings sidebar
    toggleSettings: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.SHOW_SETTINGS,
            data: data
        });
    },

    // toggles the notifications sidebar
    toggleNotifications: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.SHOW_NOTIFICATIONS,
            data: data
        });
    },

    // new posts
    addNewPost: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.NEW_POST,
            data: data
        });
    },

    // new profile pic
    addNewProfilePicture: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.NEW_PROFILE_PICTURE,
            data: data
        });
    },

    // show picture upload modal
    togglePictureUpload: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.SHOW_PICTURE_CHANGE,
            data: data
        });
    },

    // show post upload modal
    toggleNewPostModal: function(data){
        AppDispatcher.handleAction({
            actionType: WondrousConstants.SHOW_NEW_POST,
            data: data
        });
    }
}

module.exports = WondrousActions
