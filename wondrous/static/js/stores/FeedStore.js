var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');

var defaultFeed = [];
var defaultPosts = {};

var FeedStore = Reflux.createStore({
    listenables: WondrousActions,
    init:function(){
        this.feed = defaultFeed;
        this.posts = defaultPosts;
        this.current_page = 0;
        this.donePaging = false;
        this.paging = false;

        this.listenTo(UserStore,this.onUserChange);
    },
    onUserChange: function(userData){
        if(userData.hasOwnProperty('user')){
            WondrousActions.loadFeed(this.current_page);
        }
    },

    updateFeed: function(feedItems){
        this.paging = false; 
        if (feedItems.length==0){
            this.donePaging = true;
        }
        for(var i = 0; i < feedItems.length; i++){
            this._addToFeed(feedItems[i]);
        }
        this.trigger(this.getFeed());
    },

    _addToFeed: function(post){
        if(!this.posts.hasOwnProperty(String(post.id))){
            this.feed.push(post.id);
        }
        this.posts[String(post.id)] = post;
    },

    addToFeed: function(post){
        this._unshiftToFeed(post);
        this.trigger(this.getFeed());
    },

    incrementPage: function(){
        this.current_page++;
    },

    _unshiftToFeed: function(post){
        if(!this.posts.hasOwnProperty(String(post.id))){
            this.wall.unshift(post.id);
        }
        this.posts[String(post.id)] = post;
    },

    getFeed: function(){
        return this.feed.map(function(post_id,index){
            return this[String(post_id)]
        },this.posts);
    },

    removeFromFeed: function(post_id){
        var to_delete = -1;
        for(var i = 0; i < this.feed.length; i++){
            if(this.feed[i]==post_id){
                to_delete = i;
                console.log("deleting id",post_id,to_delete)
                break;
            }
        }

        if(to_delete!=-1){
            delete this.posts[String(this.feed[i])];
            this.feed.splice(to_delete,1);
            this.trigger(this.getFeed());
        }

    }

});


module.exports = FeedStore;
