var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');
var PostStore = require('../stores/PostStore');
var FeedSet = require('../libs/FeedSet');

var FeedStore = Reflux.createStore({
    listenables: WondrousActions,
    init:function(){
        this.feed = new FeedSet(null);
        this.currentPage = 0;
        this.donePaging = false;
        this.paging = false;
        this.listenTo(UserStore,this.onUserChange);
    },

    onUserChange: function(userData){
        this.loadMore();
    },

    loadMore: function(){
        if(!this.paging&&!this.donePaging){
            this.paging = true;
            WondrousActions.loadFeed(this.currentPage);
            this.currentPage++;
        }

        if(UserStore.loaded&&!UserStore.loggedIn){
            this.donePaging = true;
        }
    },
    //
    // updateUser: function(userData) {
    //     this.unloadUser();
    // },

    unloadUser: function(){
        this.feed.reset();
        this.currentPage = 0;
        this.donePaging = false;
        this.paging = false;
    },

    updateFeed: function(feedItems){
        this.paging = false;
        if (feedItems.length<15){
            this.donePaging = true;
        }
        for(var i = 0; i < feedItems.length; i++){
            this.feed.push(feedItems[i]);
        }
        console.log("feed is now",this.feed.sortedSet.length);
        this.trigger(this.getFeed());
    },

    addToFeed: function(post){
        this.feed.unshift(post);
        this.trigger(this.getFeed());
    },

    getFeed: function(){
        return this.feed.sortedSet;
    },

    removeFromFeed: function(post_id){
        this.feed.delete(post_id);
        this.trigger(this.getFeed());
    },

    updatePostOnFeed: function(){
        var key = this.feed.update(PostStore.post);
        this.trigger(this.getFeed());
    }

});


module.exports = FeedStore;
