var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var WondrousConstants = require('../constants/WondrousConstants');
var _ = require('underscore');

// Define initial notifications for the feed
var _notes = [], _current_page = 0;

// Method to load feed data from API
function loadNoteData(data){
    Array.prototype.push.apply(_notes,data);
    if(data.length>0){
        _current_page++;
    }
}

function addNewNote(note){
    _notes.unshift(note);
}

// Extend NotificationStore with EventEmitter and underscore
var NotificationStore = _.extend({},EventEmitter.prototype,{

    // Return the whole entire feed array, essentially an array of notifications
    getNotifications: function(){
        return _notes;
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
        // Respond to NOTIFICATION_RECEIVE
        case WondrousConstants.NOTIFICATION_RECEIVE:
            addNewNote(action.data);
            break;

        // Respond to NOTIFICATION_LOAD
        case WondrousConstants.NOTIFICATION_LOAD:
            loadNoteData(action.data);
            break;

        default:
            return true;
    }

    // If action was responded to, emit the change event
    NotificationStore.emitChange();
    return true;
});

module.exports = NotificationStore;
