var WondrousActions = require('../actions/WondrousActions');
var FeedSet = require('../libs/FeedSet');

var SearchStore = Reflux.createStore({
    listenables: WondrousActions,

    init: function(){
        this.unloadUser();
        this.trigger({users:this.users.sortedSet,posts:this.posts.sortedSet});
    },

    unloadUser: function(){
        this.users = new FeedSet(null,false,false);
        this.posts = new FeedSet(null,false,false);

        this.searchingPost = false;
        this.searchingUser = false;
        this.doneSearchingPost = false;
        this.doneSearchingUser = false;

        this.currentUserPage = 0;
        this.currentPostPage = 0;
    },

    newSearch: function(term,tag){
        tag = tag == true

        this.unloadUser();

        if (tag){
            this.searchingPost = this.searchingUser = true;
            WondrousActions.searchForUserTags(term,this.currentUserPage);
            WondrousActions.searchForTags(term,this.currentPostPage);
        }else{
            this.searchingPost = this.searchingUser = true;
            WondrousActions.searchForUsers(term,this.currentUserPage);
            WondrousActions.searchForPosts(term,this.currentPostPage);
        }

        this.trigger({users:this.users.sortedSet,posts:this.posts.sortedSet});
    },

    updateSearchPosts: function(posts){
        this.doneSearchingPost = posts.length>=15;
        for (var i = 0; i < posts.length; i++){
            this.posts.push(posts[i]);
        }
        this.searchingPost = false;
        this.trigger({posts:this.posts.sortedSet})
    },

    updateSearchUsers: function(users){
        this.doneSearchingUser = users.length>=15;
        for (var i = 0; i < users.length; i++){
            this.users.push(users[i]);
        }
        this.searchingUser = false;
        this.trigger({users:this.users.sortedSet})
    },

    searchError: function(error){
        this.trigger(error);
        this.searching = false;
    }
});


module.exports = SearchStore;
