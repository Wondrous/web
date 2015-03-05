var WondrousActions = require('../actions/WondrousActions');
var ProfileStore = require('../stores/ProfileStore');

var defaultWall = [];
var defaultPosts = {};

var WallStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.wall = defaultWall;
        this.posts = defaultPosts;
        this.current_page = 0;

        this.listenTo(ProfileStore,"onProfileUpdate");
    },

    onProfileUpdate: function(){
        this.wall = [];
        this.posts = {};
        this.current_page = 0;

        this.trigger(this.getWall());
    },

    updateWall: function(wallItems){
        for(var i = 0; i < wallItems.length; i++){
            this._addToWall(wallItems[i]);
        }
        this.trigger(this.getWall());
    },

    _addToWall: function(post){
        if(!this.posts.hasOwnProperty(String(post.id))){
            this.wall.push(post.id);
        }
        this.posts[String(post.id)] = post;
    },

    _unshiftToWall: function(post){
        if(!this.posts.hasOwnProperty(String(post.id))){
            this.wall.unshift(post.id);
        }
        this.posts[String(post.id)] = post;
    },

    addToWall: function(post){
        this._unshiftToWall(post);
        console.log("added",post.id,this.wall);
        this.trigger(this.getWall());
    },

    incrementPage: function(){
        this.current_page++;
        // this.refreshFromServer();
    },

    getWall: function(){
        return this.wall.map(function(post_id,index){
            return this[String(post_id)]
        },this.posts);
    },

    removeFromWall: function(post_id){
        var to_delete = -1;
        for(var i = 0; i < this.wall.length; i++){
            if(this.wall[i]==post_id){
                to_delete = i;

                break;
            }
        }

        if (to_delete!=-1){
            delete this.posts[String(this.wall[i])];
            this.wall.splice(to_delete,1);
            this.trigger(this.getWall());
        }

    }

});


module.exports = WallStore;
