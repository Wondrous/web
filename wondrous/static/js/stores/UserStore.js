var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WondrousConstants = require('../constants/WondrousConstants');
var _ = require('underscore');

// Define initial user setting
var _user = {}, _logged_in = false, _show_sidebar = false;

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
}

// Extend UserStore with EventEmitter and underscore
var UserStore = _.extend({},EventEmitter.prototype,{

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

        case WondrousConstants.TOGGLE_SIDEBAR:
            toggleSideBar();
            break;

        default:
            return true;
    }

    // If action was responded to, emit the change event
    UserStore.emitChange();
    return true;
});

module.exports = UserStore;
