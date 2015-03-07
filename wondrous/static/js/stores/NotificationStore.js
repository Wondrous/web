var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');

var defaultFeed = [];
var defaultNotifications = {};

var NotificationStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.feed = defaultFeed;
        this.notifications = defaultNotifications;
        this.currentPage = 0;
        this.listenTo(UserStore,this.onUserChange);
    },
    onUserChange: function(userData){
        if(userData.hasOwnProperty('user')){
            WondrousActions.loadNotifications(this.currentPage);
        }
    },

    updateNotification: function(feedItems){
        for(var i = 0; i < feedItems.length; i++){
            this._addToNotification(feedItems[i]);
        }
        this.trigger(this.getNotifications());
    },

    _addToNotification: function(post){
        if(!this.notifications.hasOwnProperty(String(post.id))){
            this.feed.push(post.id);
        }
        this.notifications[String(post.id)] = post;
    },

    incrementPage: function(){
        this.currentPage++;
        this.refreshFromServer();
    },

    getNotifications: function(){

        return this.feed.map(function(note_id,index){
            return this[String(note_id)]
        },this.notifications);
    }

});


module.exports = NotificationStore;
