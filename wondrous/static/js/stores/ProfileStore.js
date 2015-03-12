var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var FeedSet = require('../libs/FeedSet');

var defaultUser = {username:''};

var ProfileStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.newProfile();
        this.listenTo(UserStore,"onUserChange");
    },

    unloadUser: function(){
        this.newProfile();
    },

    newProfile: function(){
        this.user = defaultUser;
        this.followerPage = 0;
        this.followingPage = 0;

        this.following = new FeedSet(null);
        this.followers = new FeedSet(null);
    },
    onUserChange: function(userData){
        if(userData.hasOwnProperty("user") && userData.user.username===this.user.username){
            this.user.ouuid = userData.user.ouuid;
            this.trigger({profile:this.user});
        }
    },
    updateProfile: function(profile){
        this.newProfile();
        this.user = profile;
        console.log("profile",profile);
        this.trigger({profile:this.user});
    },

    profileError: function(err){
        this.user = defaultUser;
        this.trigger({profile:this.user});
    },

    updateFollowers: function(followers){
        for (var i = 0; i < followers.length; i++){
            if (ProfileStore.user.id!=followers[i].id){
                this.followers.push(followers[i]);
            }
        }

        this.trigger({followers:this.followers.sortedSet})
    },

    updateFollowing: function(following){
        for (var i = 0; i < following.length; i++){
            if (ProfileStore.user.id!=following[i].id){
                this.following.push(following[i]);
            }
        }

        this.trigger({following:this.following.sortedSet})
    }
});


module.exports = ProfileStore;
