var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WondrousConstants = require('../constants/WondrousConstants');
var _ = require('underscore');

// Define initial posts for the feed
var _posts = [], _current_page = 0;

// Method to load feed data from API
function loadFeedData(data){
    Array.prototype.push.apply(_posts,data);
    if(data.length>0){
        _current_page++;
    }
}

// Extend FeedStore with EventEmitter and underscore
var FeedStore = _.extend({},EventEmitter.prototype,{

    // Return the whole entire feed array, essentially an array of posts
    getFeed: function(){
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
        // Respond to POST_RECEIVE
        case WondrousConstants.POST_RECEIVE:
            loadFeedData(action.data);
            break;

        // Respond to FEED_LOAD
        case WondrousConstants.FEED_LOAD:
            loadFeedData(action.data);
            break;

        default:
            return true;
    }

    // If action was responded to, emit the change event
    FeedStore.emitChange();
    return true;
});

module.exports = FeedStore;
