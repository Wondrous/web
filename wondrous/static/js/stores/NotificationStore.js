var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');
var ps = require('PushStream');

var defaultFeed = [];
var defaultNotifications = {};

var NotificationStore = Reflux.createStore({
    listenables: WondrousActions,

    // pushstream stuff
    onmessage: function(text,id,channel){
        console.log("received push",text,id,channel);
    },
    onstatuschange: function(status){
        console.log("pushstream status:",status);
        if (status==PushStream.OPEN){
            this.subscribed = true;
        }else if (status==PushStream.CLOSED){
            this.subscribed = false;
        }
    },
    onerror: function(error){
        console.error("pushstream error:",error);
    },
    handleUnload: function(){
        this.pushstream.disconnect();
    },
    ////

    init:function(){
        this.feed = defaultFeed;
        this.notifications = defaultNotifications;
        this.currentPage = 0;
        this.subscribed = false;
        this.listenTo(UserStore,this.onUserChange);

        this.pushstream  = new PushStream({
            host:"104.236.251.250",
            port:"80",
            modes: 'websocket',
            useJSONP:true
        });

        this.pushstream.onmessage = this.onmessage;
        this.pushstream.onstatuschange = this.onstatuschange;
        this.pushstream.onerror = this.onerror;
        window.onbeforeunload = this.handleUnload;

    },

    onUserChange: function(userData){
        if(userData.hasOwnProperty('user')){
            if(UserStore.loggedIn&&!this.subscribed && userData.user.hasOwnProperty('auth')){
                console.log("auth lol",userData.user.auth)
                try {
                    this.pushstream.addChannel(userData.user.auth);
                    this.pushstream.connect();
                    console.log("pushstream connected to",userData.user.auth);
                } catch(e) {
                    this.onerror(e);
                };

                WondrousActions.loadNotifications(this.currentPage);
                this.subscribed=true;
            }else if(this.subscribed){
                this.pushstream.disconnect();
            }
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
