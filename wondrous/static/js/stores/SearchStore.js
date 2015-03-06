var WondrousActions = require('../actions/WondrousActions');
var Set = require("collections/set");

var getNewSet = function(){
    return new Set(null, function(a,b){
        return a.id==b.id;
    }, function(obj){
        return String(obj.id);
    });
}

var SearchStore = Reflux.createStore({
    listenables: WondrousActions,

    init: function(){
        this.searching = false;
        this.newSearch();
    },

    newSearch: function(term){
        this.users = getNewSet();
        this.posts = getNewSet();
        this.current_users_page = 0;
        this.current_posts_page = 0;

        this.searching = true;
        WondrousActions.searchForUsers(term,this.current_users_page);
        WondrousActions.searchForPosts(term,this.current_posts_page);

        this.trigger({users:this.users.toArray(),posts:this.posts.toArray()});
    },

    updateSearchPosts: function(posts){
        for (var i = 0; i < posts.length; i++){
            this.posts.add(posts[i]);
        }
        this.searching = false;
        this.trigger({posts:this.posts.toArray()})
    },

    updateSearchUsers: function(users){
        for (var i = 0; i < users.length; i++){
            this.users.add(users[i]);
        }
        this.searching = false;
        this.trigger({users:this.users.toArray()})
    },

    searchError: function(error){
        this.trigger(error);
        this.searching = false;
    }
});


module.exports = SearchStore;
