var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');
var ps = require('PushStream');
var Set = require("collections/set");

var getNewSet = function(arr){
    return new Set(arr, function(a,b){
        return a.id==b.id;
    }, function(obj){
        return String(obj.id);
    });
}

var NOTIFICATION = {
    COMMENTED:0,
    UPDATED:1,
    LIKED:2,
    FOLLOWED:3,
    FOLLOW_REQUEST:4,
    FOLLOW_ACCEPTED:5,
    REPOSTED:6,
    FEED:7
}

var NotificationStore = Reflux.createStore({
    listenables: WondrousActions,

    // pushstream stuff
    onmessage: function(note,id,channel){
        this.unseen++;
        var temp = this.notifications.toArray();
        temp.unshift(note);
        this.notifications = getNewSet(temp);
        this.trigger(this.notifications);
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
        this.notifications = getNewSet(null);
        this.unseen = 0;
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
                try {
                    this.pushstream.addChannel(userData.user.auth);
                    this.pushstream.connect();
                    console.log("pushstream connected to",userData.user.auth);
                } catch(e) {
                    this.onerror(e);
                };

                WondrousActions.loadNotifications(this.currentPage);
                this.unseen = userData.user.unseen_notifications;
                this.subscribed=true;
                this.trigger({});
            }else if(this.subscribed){
                this.pushstream.disconnect();
                this.subscribed=false;
                this.pushstream  = new PushStream({
                    host:"104.236.251.250",
                    port:"80",
                    modes: 'websocket',
                    useJSONP:true
                });
            }

            if(!UserStore.loggedIn){
                this.pushstream.disconnect();
                this.subscribed=false;
                this.pushstream  = new PushStream({
                    host:"104.236.251.250",
                    port:"80",
                    modes: 'websocket',
                    useJSONP:true
                });
            }
        }
    },

    toggleNotifications: function(){
        if (UserStore.sidebarOpen){
            this.unseen = 0;
            WondrousActions.setNotificationSeen();
            this.trigger();
        }
    },
    updateNotification: function(feedItems){
        for(var i = 0; i < feedItems.length; i++){
            this._addToNotification(feedItems[i]);
        }
        this.trigger();
    },

    _addToNotification: function(note){
        this.notifications.add(note);
    },

    incrementPage: function(){
        this.currentPage++;
        this.refreshFromServer();
    },

    getNotifications: function(){
        return this.notifications;
    }

});


module.exports = NotificationStore;
