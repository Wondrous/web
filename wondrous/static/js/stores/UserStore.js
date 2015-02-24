var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WondrousConstants = require('../constants/WondrousConstants');
var ps = require('PushStream');
var _ = require('underscore');


// Define initial user setting
var _user = {}, _logged_in = false, _show_sidebar = false,
_showing = null, _clickOnProfilePicture, _modalOpen =false, _modalType=-1;
_to_repost = {};

var pushstream = new PushStream({
    host:"104.236.251.250",
    port:"80",
    modes: 'websocket',
    useJSONP:true
});

// pushstream.onmessage=messageReceived;
pushstream.onmessage = function(text,id,channel) {
    console.log(text,id,channel);
};


pushstream.onstatuschange = function(status){
    if (status==PushStream.OPEN){
    }else if (status==PushStream.CLOSED){
    }
};
pushstream.onerror = function(error){
    console.log("error",error);
};

// Method to load user info from API
function loadUserData(data){
    _user = data;
    _logged_in = true;

    try {
        pushstream.addChannel(''+data.id);
        pushstream.connect();
        console.log("ws connected to ",data.id);
    } catch(e) {
        alert(e)
    };
}

// Method to clear user info
function setUserLogout(data){
    _logged_in = false;
    _user = {};
    pushstream.disconnect();
}

// Toggle sidebar
function toggleSideBar(){
    _show_sidebar = !_show_sidebar;
    if(!_show_sidebar){
        _showing = null;
    }
}

function showSettings(){
    _showing = WondrousConstants.SHOW_SETTINGS;
    toggleSideBar();
}

function showNotifications(){
    _showing = WondrousConstants.SHOW_NOTIFICATIONS;
    toggleSideBar();
}

function togglePostModal(){
    _modalOpen = !_modalOpen;
}
// Extend UserStore with EventEmitter and underscore
var UserStore = _.extend({},EventEmitter.prototype,{
    // get repost post data
    getRepost: function(){
        return _to_repost; 
    },

    // is Postmodal open?
    isPostModalOpen: function(){
        return _modalOpen;
    },

    // Return with we're uploading just a picture
    isPictureModal: function(){
        return _modalType==WondrousConstants.MODALTYPE_PICTURE;
    },

    // Return with we're reposting
    isRepostModal: function(){
        return _modalType==WondrousConstants.MODALTYPE_REPOST;
    },

    // Return the sidebar that is showing
    barOnDisplay: function(){
        return _showing;
    },

    // Return whether sidebar is open or not
    isShowingSideBar:function(){
        return _show_sidebar;
    },

    // Return whether the user is logged in or not
    isUserLoggedIn: function(){
        return _logged_in;
    },

    // Return the user objecy
    getUserData: function(){
        return _user;
    },

    // Emit Change event
    emitChange: function(){
        this.emit('change');
    },

    // Add change listener
    addChangeListener: function(callback){
        this.on('change', callback);
    },

    // Remove change listener
    removeChangeListener: function(callback){
        this.removeListener('change', callback);
    }
});

// Register callback with AppDispatcher
AppDispatcher.register(function(payload){
    var action = payload.action;

    switch(action.actionType){

        // Respond to USER_LOAD
        case WondrousConstants.USER_LOAD:
            loadUserData(action.data);
            break;

        // Resond to USER_UNLOAD
        case WondrousConstants.USER_UNLOAD:
            setUserLogout(action.data);
            break;

        case WondrousConstants.SHOW_SETTINGS:
            showSettings();
            break;

        case WondrousConstants.SHOW_NOTIFICATIONS:
            showNotifications();
            break;

        case WondrousConstants.SHOW_PICTURE_CHANGE:
            togglePostModal();
            _modalType = WondrousConstants.MODALTYPE_PICTURE;
            break;

        case WondrousConstants.SHOW_NEW_POST:
            togglePostModal();
            _modalType = WondrousConstants.MODALTYPE_POST;
            break;

        case WondrousConstants.SHOW_NEW_REPOST:
            togglePostModal();
            _modalType = WondrousConstants.MODALTYPE_REPOST;
            _to_repost = action.data;
            break;

        case WondrousConstants.NEW_PROFILE_PICTURE:
            _user.ouuid = action.data;
            break;

        default:
            return true;
    }

    // If action was responded to, emit the change event
    UserStore.emitChange();
    return true;
});

module.exports = UserStore;
