var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var Set = require("collections/set");

var defaultUser = {username:''};

var getNewSet = function(){
    return new Set(null, function(a,b){
        return a.id==b.id;
    }, function(obj){
        return obj.username;
    });
}

var ProfileStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.newProfile();

        this.listenTo(UserStore,"onUserChange");
    },

    newProfile: function(){
        this.user = defaultUser;
        this.followerPage = 0;
        this.followingPage = 0;

        this.following = getNewSet();
        this.followers = getNewSet();
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
        this.trigger({profile:this.user});
    },

    profileError: function(err){
        this.user = defaultUser;
        this.trigger({profile:this.user});
    },

    updateFollowers: function(followers){
        for (var i = 0; i < followers.length; i++){
            if (ProfileStore.user.id!=followers[i].id){
                this.followers.add(followers[i]);
            }
        }

        this.trigger({followers:this.followers.toArray()})
    },

    updateFollowing: function(following){
        for (var i = 0; i < following.length; i++){
            if (ProfileStore.user.id!=following[i].id){
                this.following.add(following[i]);
            }
        }

        this.trigger({following:this.following.toArray()})
    }
});


module.exports = ProfileStore;
