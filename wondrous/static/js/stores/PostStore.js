var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WondrousConstants = require('../constants/WondrousConstants');
var _ = require('underscore');

// Define initial posts for the feed
var _comments = [], _current_page = 0, _username = null;

// Method to load wall data from API
function loadCommentData(data){
    Array.prototype.push.apply(_comments, data);
    if(data.length>0){
        _current_page++;
    }
}

function addNewComment(comment){
    _comments.unshift(comment);
}

function deleteComment(comment_id){
    var to_delete = -1;
    for(var i = 0; i < _comments.length; i++){
        if(_comments[i].id == comment_id){
            to_delete = i;
            break;
        }
    }

    if (to_delete > -1) {
        delete _comments[to_delete];
    }
}

// Extend PostStore with EventEmitter and underscore
var PostStore = _.extend({}, EventEmitter.prototype, {

    // Return the whole entire posts array, essentially an array of posts
    getPostComments: function() {
        console.log("posts comments", _comments.length);
        return _comments;
    },

    // Emit Change event
    emitChange: function() {
        this.emit('change');
    },

    // Add change listener
    addChangeListener: function(callback) {
        this.on('change', callback);
    },

    // Remove change listener
    removeChangeListener: function(callback) {
        this.removeListener('change', callback);
    }
});

// Register callback with AppDispatcher
AppDispatcher.register(function(payload) {
    var action = payload.action;

    switch(action.actionType) {

        // Respond to COMMENT_LOAD
        case WondrousConstants.COMMENT_LOAD:
            _comments = [];
            loadCommentData(action.data);
            break;

        default:
            return true;
    }

    // If action was responded to, emit the change event
    PostStore.emitChange();
    return true;
});

module.exports = PostStore;
