var WondrousActions = require('../actions/WondrousActions');
var WondrousConstants = require('../constants/WondrousConstants');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');
var ps = require('PushStream');
var FeedSet = require("../libs/FeedSet");
var NotificationConstants = require('../constants/NotificationConstants');

var NotificationStore = Reflux.createStore({
    listenables: WondrousActions,
    // pushstream stuff
    onmessage: function(note,id,channel){
        if(note.reason===NotificationConstants.FEED){

            setTimeout(function(){
                console.log("loading",note.subject_id);
                WondrousActions.loadPost(note.subject_id,true);
            },2000);

        }else{
            if (UserStore.sidebarOpen==true && UserStore.sidebarType==WondrousConstants.SHOW_NOTIFICATIONS){
                WondrousActions.setNotificationSeen();
            }else{
                this.unseen++;
                document.title = "Wondrous ("+String(this.unseen)+")";
            }

            this.notifications.push(note);
            this.trigger(this.notifications);
        }
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

    initializeClient: function(){
        this.pushstream  = new PushStream({
            host:"104.236.251.250",
            port:"80",
            modes: 'websocket',
            useJSONP:true
        });

        this.pushstream.onmessage = this.onmessage;
        this.pushstream.onstatuschange = this.onstatuschange;
        this.pushstream.onerror = this.onerror;
    },

    init:function(){
        this.unloadUser();
        this.listenTo(UserStore,this.onUserChange);
        window.onbeforeunload = this.handleUnload;
    },

    unloadUser: function(){
        this.notifications = new FeedSet(null,false);
        this.unseen = 0;
        this.currentPage = 0;
        this.paging = false;
        this.donePaging = false;
        this.subscribed = false;
        this.initializeClient();
    },

    loadMore: function(){
        if (!this.paging && !this.donePaging){
            this.paging = true;
            WondrousActions.loadNotifications(this.currentPage);
            this.incrementPage();
        }
    },
    establishConnection: function(userData){
        try {
            this.pushstream.addChannel(userData.user.auth);
            this.pushstream.connect();
            console.log("pushstream connected to",userData.user.auth);
        } catch(e) {
            this.onerror(e);
        };

        this.loadMore();
        this.unseen = userData.user.unseen_notifications;
        this.subscribed=true;
        this.trigger({});
    },
    onUserChange: function(userData){
        if(userData.hasOwnProperty('user')){
            if(UserStore.loggedIn&&!this.subscribed && userData.user.hasOwnProperty('auth')){
                var that = this;
                setTimeout(function(){
                    that.establishConnection(userData);
                },750);
            }else if(this.subscribed){
                this.pushstream.disconnect();
                this.subscribed=false;
                this.initializeClient();
            }

            if(!UserStore.loggedIn){
                this.pushstream.disconnect();
                this.subscribed=false;
                this.initializeClient();
            }
        }
    },

    toggleNotifications: function(){
        if (UserStore.sidebarOpen){
            this.unseen = 0;
            document.title = "Wondrous"

            WondrousActions.setNotificationSeen();
            this.trigger();
        }
    },
    updateNotification: function(feedItems){
        if (feedItems.length<15){
            this.donePaging = true;
        }
        this.paging = false;
        for(var i = 0; i < feedItems.length; i++){
            this._addToNotification(feedItems[i]);
        }
        this.trigger();
    },

    _addToNotification: function(note){
        this.notifications.push(note);
    },

    incrementPage: function(){
        this.currentPage++;
    },

    getNotifications: function(){
        return this.notifications.sortedSet;
    }

});


module.exports = NotificationStore;
