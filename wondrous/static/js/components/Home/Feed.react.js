var Post = require('../Post/Post.react');

var FeedStore = require('../../stores/FeedStore');
var UserStore = require('../../stores/UserStore');
var WondrousActions = require('../../actions/WondrousActions');
var MasonryMixin = require('../../vendor/masonry.mixin');
var checkLogin = require('../../utils/Func').checkLogin;

var masonryOptions = {
    transitionDuration: 0,
    itemSelector: ".masonry-brick",
    columnWidth: ".grid-sizer"
};

var Feed = React.createClass({
    mixins: [
        MasonryMixin('masonryContainer', masonryOptions),
        Reflux.listenTo(FeedStore,'onFeedUpdate'),
        Reflux.listenTo(UserStore,'onUserUpdate'),
        Router.State
    ],

    checkForParams: function(){
        var post_id = this.getParams().post_id;
        if (typeof post_id !== 'undefined'){
            WondrousActions.newPostLoad(post_id);
        }
    },


    getInitialState: function() {
        this.checkForParams();
        return {data: FeedStore.feed.sortedSet};
    },

    onFeedUpdate: function(posts){

        this.setState({data:posts})
    },

    onUserUpdate: function(userData){
        this.forceUpdate();
    },

    // Add change listener to stores
    componentDidMount: function() {
        FeedStore.loadMore();
        WondrousActions.feedLoaded();
    },

    promptSignup: function(){
        checkLogin();
    },

    render: function() {

        var posts = this.state.data.map(function(post, index) {
            return (
                <Post key={post.id} data={post}/>
            );
        });

        return (
            <div className="grid-padding">
                <div ref="scrollBox">
                    <h1 className="tmp-feed-h1">Majority Feed</h1>
                    <div className="masonry" ref="masonryContainer" id="asyncPosts">
                        <div className="backdrop"></div>
                        <div className="grid-sizer" style={{"display": "none"}}></div>
                        {posts}
                    </div>
                    <div>
                    {!FeedStore.donePaging&&posts.length>0&&UserStore.loggedIn?<img className="loading-wheel" src="/static/pictures/p.loading.gif"/>:{}}
                    {UserStore.loaded&&!UserStore.loggedIn?<a onClick={this.promptSignup}><h1>Load More</h1></a>:{}}
                    </div>
                </div>
            </div>
        );
    },
});


module.exports = Feed;
