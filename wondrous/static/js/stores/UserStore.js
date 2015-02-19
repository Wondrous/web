var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WondrousConstants = require('../constants/WondrousConstants');
var _ = require('underscore');

// Define initial user setting
var _user = {}, _logged_in = false, _show_sidebar = false, _showing = null;

// Method to load user info from API
function loadUserData(data){
    _user = data;
    _logged_in = true;
}

// Method to clear user info
function setUserLogout(data){
    _logged_in = false;
    _user = {};
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

// Extend UserStore with EventEmitter and underscore
var UserStore = _.extend({},EventEmitter.prototype,{

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

        default:
            return true;
    }

    // If action was responded to, emit the change event
    UserStore.emitChange();
    return true;
});

module.exports = UserStore;
