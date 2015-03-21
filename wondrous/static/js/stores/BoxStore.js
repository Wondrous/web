// for global statics/matches

var WondrousActions = require('../actions/WondrousActions');
var WondrousConstants = require('../constants/WondrousConstants');
var Set = require("collections/set");

var BoxStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.unloadUser();
    },

    updateUser: function(userData) {
        this.loadMoreTrends();
    },

    loadMoreTrends: function(){
        if(!this.trendingLoad && !this.trendingLoadDone){
            WondrousActions.loadTrending(this.trendingPage);
            this.trendingPage++;
        }
    },

    unloadUser: function(){
        this.trendingPage = 0;
        this.trendingLoad = false;
        this.trendingLoadDone = false;
        this.trending = new Set(null, function(a,b){
            return a.tag_name === b.tag_name
        }, function(obj){
            return obj.tag_name
        });
    },

    updateTrending: function(trending_tags){
        this.trendingLoadDone = trending_tags.length<10;
        this.trendingLoad = false;

        trending_tags.map(function(tag,ind){
            this.add(tag);
        },this.trending);
        this.trigger();
    }
});


module.exports = BoxStore;
