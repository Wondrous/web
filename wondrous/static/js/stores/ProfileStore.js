var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WondrousConstants = require('../constants/WondrousConstants');
var _ = require('underscore');

// Define initial profile setting
var _profile = {};

// Method to load profile info from API
function loadProfileData(data){
    _profile = data;
}

// Extend ProfileStore with EventEmitter and underscore
var ProfileStore = _.extend({},EventEmitter.prototype,{

    // Return the profile object
    getProfileData: function(){
        return _profile;
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

        // Respond to PROFILE_LOAD
        case WondrousConstants.PROFILE_LOAD:
            loadProfileData(action.data);
            break;

        default:
            return true;
    }

    // If action was responded to, emit the change event
    ProfileStore.emitChange();
    return true;
});

module.exports = ProfileStore;
