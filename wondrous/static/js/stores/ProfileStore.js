var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var Set = require("collections/set");

var defaultUser = {username:''};

var ProfileStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.user = defaultUser;
        this.follower_page = 0;
        this.following_page = 0;

        this.following = this.followers = new Set(null, function(a,b){
            return a.id==b.id;
        }, function(obj){
            return obj.id;
        });

        this.listenTo(UserStore,"onUserChange");
    },
    onUserChange: function(userData){
        if(userData.hasOwnProperty("user") && userData.user.username===this.user.username){
            this.user.ouuid = userData.user.ouuid;
            this.trigger({profile:this.user});
        }
    },
    updateProfile: function(profile){
        this.user = profile;
        this.following = this.followers = new Set(null, function(a,b){
            return a.id==b.id;
        }, function(obj){
            return obj.username;
        });

        this.follower_page = 0;
        this.following_page = 0;
        this.trigger({profile:this.user});
    },

    profileError: function(err){
        this.user = defaultUser;
        this.trigger({profile:this.user});
    },

    updateFollowers: function(followers){
        for (var i = 0; i < followers.length; i++){
            this.followers.add(followers[i]);
        }

        this.trigger({followers:this.followers.toArray()})
    },

    updateFollowing: function(following){
        for (var i = 0; i < following.length; i++){
            this.following.add(following[i]);
        }

        this.trigger({following:this.following.toArray()})
    }
});


module.exports = ProfileStore;
