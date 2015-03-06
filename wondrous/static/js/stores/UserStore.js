var WondrousActions = require('../actions/WondrousActions');
var WondrousConstants = require('../constants/WondrousConstants');
var WondrousAPI = require('../utils/WondrousAPI');

var ps = require('PushStream');
_subed = false;
var pushstream = new PushStream({
    host:"104.236.251.250",
    port:"80",
    modes: 'websocket',
    useJSONP:true
});


pushstream.onmessage = function(text,id,channel) {
    console.log(text,id,channel);
};

pushstream.onstatuschange = function(status){
    if (status==PushStream.OPEN){
    }else if (status==PushStream.CLOSED){
    }
};
pushstream.onerror = function(error){
    console.log("error",error);
};


var defaultUser = {};

var UserStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.user = defaultUser;
        this.loggedIn = false;
        this.modalOpen = false;
        this.sidebarOpen = false;

        this.sidebarType = null;
        this.modalType = null;
        WondrousActions.auth();
    },

    updateUser: function(userData){
        this.user = userData;
        this.loggedIn = true;

        try {
            if (!_subed){
                pushstream.addChannel(''+userData.id);
                pushstream.connect();
                console.log("ws connected to ",userData.id);
                _subed = true;
            }

        } catch(e) {
            alert(e)
        };

        this.trigger({user:this.user});
    },

    logout: function(){
        this.user = {};
        this.loggedIn = false;
        this.modalOpen = false;
        this.sidebarOpen = false;

        this.sidebarType = null;
        this.modalType = null;

        if(_subed){
            pushstream.disconnect();
        }

        this.trigger({user:this.user});
    },

    toggleSideBar:function(){
        this.sidebarOpen = !this.sidebarOpen;
        if(!this.sidebarOpen){
            this.sidebarType = null;
        }
    },

    togglePictureModal: function(){
        this.modalType = WondrousConstants.MODALTYPE_PICTURE;
        this.modalOpen = !this.modalOpen;
        this.trigger({modalType:this.modalType});
    },

    togglePostModal: function(){
        this.modalType = WondrousConstants.MODALTYPE_POST;
        this.modalOpen = !this.modalOpen;
        this.trigger({modalType:this.modalType});
    },

    toggleSettings: function(){
        this.sidebarType = WondrousConstants.SHOW_SETTINGS;
        this.toggleSideBar();
        this.trigger({sidebarType:this.sidebarType});
    },

    toggleNotifications: function(){
        this.sidebarType = WondrousConstants.SHOW_NOTIFICATIONS;
        this.toggleSideBar();
        this.trigger({sidebarType:this.sidebarType});
    }

});

module.exports = UserStore;
