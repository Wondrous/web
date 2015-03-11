var WondrousActions = require('../actions/WondrousActions');
var ProfileStore = require('../stores/ProfileStore');
var PostStore = require('../stores/PostStore');
var FeedSet = require('../libs/FeedSet');

var WallStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.wall = new FeedSet(null);
        this.currentPage = 0;
        this.donePaging = false;
        this.paging = false;
        this.username = '';
    },

    unloadUser: function(){
        this.wall.reset();
        this.currentPage = 0;
        this.donePaging = false;
        this.paging = false;
        this.username = '';
    },

    newProfile: function(username){
        if (typeof username!=='undefined'){
            this.currentPage = 0;
        }

        this.donePaging = false;
        this.paging = false;
        this.username = username;
        this.wall.reset();

    },

    loadMore: function(username){
        if (typeof username !=='undefined'){
            this.username = username;
        }

        if(!this.paging&&!this.donePaging&&this.username!==''){
            this.paging = true;
            WondrousActions.loadWall(this.username,this.currentPage);
            this.incrementPage();
        }
    },

    loadWallError: function(){
        this.paging = false;
        this.trigger();
    },

    updateWall: function(wallItems){
        if (wallItems.length<15){
            this.donePaging = true;
        }
        this.paging = false;
        for(var i = 0; i < wallItems.length; i++){
            this.wall.push(wallItems[i]);
        }
        
        this.trigger(this.getWall());
    },

    addToWall: function(post){
        this.wall.unshift(post);
        this.trigger(this.getWall());
    },

    incrementPage: function(){
        this.currentPage++;
    },

    getWall: function(){
        return this.wall.sortedSet;
    },

    removeFromWall: function(post_id){
        var key = this.wall.delete(post_id);
        this.trigger(this.getWall());
    },

    updatePostOnWall: function(){
        var key = this.wall.update(PostStore.post);
        this.trigger(this.getWall());
    }

});


module.exports = WallStore;
