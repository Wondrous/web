var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WondrousConstants = require('../constants/WondrousConstants');
var _ = require('underscore');

// Define initial profile setting
var _profile = {}, _followers = {}, _following = {};

// Method to load profile info from API
function loadProfileData(data){
    _followers = {};
    _following = {};
    _profile = data;
}

// Add into followers
function loadFollowers(data){
    for (var i = 0; i < data.length; i++){
        var key = String(data[i].id);
        if (_profile.id!=key){
            _followers[key] = data[i];
        }

    }
}

// Add into following
function loadFollowing(data){
    for (var i = 0; i < data.length; i++){
        var key = String(data[i].id);
        if (_profile.id!=key){
            _following[key] = data[i];
        }
    }
}

// Extend ProfileStore with EventEmitter and underscore
var ProfileStore = _.extend({},EventEmitter.prototype,{
    // Return the followers
    getProfileFollower: function(){
        var follower = [];
        for (var k in _followers){
            if (_followers.hasOwnProperty(k)){
                follower.push(_followers[k]);
            }
        }
        return follower;
    },

    // Return the following
    getProfileFollowing: function(){
        var follower = [];
        for (var k in _following){
            if (_following.hasOwnProperty(k)){
                follower.push(_following[k]);
            }
        }
        return follower;
    },

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
            // clear out everything
            _followers, _following = {};
            loadProfileData(action.data);
            break;

        // Respond to FOLLOWER_LOAD
        case WondrousConstants.FOLLOWER_LOAD:
            loadFollowers(action.data);
            break;

        // Respond to FOLLOWING_LOAD
        case WondrousConstants.FOLLOWING_LOAD:
            loadFollowing(action.data);
            break;

        default:
            return true;
    }

    // If action was responded to, emit the change event
    ProfileStore.emitChange();
    return true;
});

module.exports = ProfileStore;
