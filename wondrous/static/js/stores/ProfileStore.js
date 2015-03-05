var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');

var defaultUser = {username:''};

var ProfileStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.user = defaultUser;
        this.following = [];
        this.followers = [];

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
        this.following = [];
        this.followers = [];
        this.trigger({profile:this.user});
    },

    profileError: function(err){
        this.user = defaultUser;
        this.trigger({profile:this.user});
    },

    updateFollowers: function(followers){
        this.followers = followers;
        for (var k in this.followers){
            if (this.followers.hasOwnProperty(k)){
                follower.push(this.followers[k]);
            }
        }
        this.trigger({followers:this.followers})
    },

    updateFollowing: function(following){
        this.following = following;
        for (var k in this.following){
            if (this.following.hasOwnProperty(k)){
                this.following.push(_following[k]);
            }
        }
        this.trigger({following:this.following})
    }
});


module.exports = ProfileStore;
