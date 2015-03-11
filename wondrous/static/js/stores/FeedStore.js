var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');
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
        if(userData.hasOwnProperty('user')){
            this.loadMore();
        }
    },

    loadMore: function(){
        if(!this.paging&&!this.donePaging){
            this.paging = true;
            WondrousActions.loadFeed(this.currentPage);
            this.incrementPage();
        }
    },

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

    incrementPage: function(){
        this.currentPage++;
    },

    getFeed: function(){
        return this.feed.sortedSet;
    },

    removeFromFeed: function(post_id){
        return this.feed.delete(post_id);
    }

});


module.exports = FeedStore;
