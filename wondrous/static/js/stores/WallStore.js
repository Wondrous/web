var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WondrousConstants = require('../constants/WondrousConstants');
var _ = require('underscore');

// Define initial posts for the feed
var _posts = [], _current_page = 0, _username = null;

// Method to load wall data from API
function loadWallData(data){
    Array.prototype.push.apply(_posts,data);
    if(data.length>0){
        _current_page++;
    }
}

function addNewPost(post){
    _posts.unshift(post);
}


// Extend WallStore with EventEmitter and underscore
var WallStore = _.extend({},EventEmitter.prototype,{

    // Return the whole entire posts array, essentially an array of posts
    getWallData: function(){
        return _posts;
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
        // Respond to NEW_POST
        case WondrousConstants.NEW_POST:
            addNewPost(action.data);
            break;

        // Respond to WALL_LOAD
        case WondrousConstants.WALL_LOAD:
            _posts = [];
            loadWallData(action.data);
            break;

        default:
            return true;
    }

    // If action was responded to, emit the change event
    WallStore.emitChange();
    return true;
});

module.exports = WallStore;
