var Post = require('./Post.react');
var FeedStore = require('../stores/FeedStore');
var UserStore = require('../stores/UserStore');
var WondrousActions = require('../actions/WondrousActions');
var MasonryMixin = require('../vendor/masonry.mixin');

// Method to retrieve state from stores
function getFeedState() {
    var data = FeedStore.getFeed();
    return data;
}

var masonry = null;

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
        Router.Navigation
    ],

    getInitialState: function() {
        return {data: FeedStore.getFeed(), paging: false};
    },

    onFeedUpdate: function(posts){
        this.setState({data:posts})
    },

    onUserUpdate: function(userData){

    },

    checkWindowScroll: function(){
        // Get scroll pos & window data
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var s = document.body.scrollTop;
        var scrolled = (h + s) > document.body.offsetHeight;

        // If scrolled enough, not currently paging and not complete...
        if(scrolled && !FeedStore.paging && !FeedStore.donePaging) {
            FeedStore.paging = true;
            console.log("getting more page")
            FeedStore.incrementPage();
            WondrousActions.loadFeed(FeedStore.current_page);
        }
    },

    // Add change listener to stores
    componentDidMount: function() {
        WondrousActions.loadFeed(FeedStore.current_page);
        window.addEventListener('scroll', this.checkWindowScroll);
    },

    render: function() {
        var posts = this.state.data.map(function(post, index) {
            return (
                <Post key={post.id} data={post}/>
            );
        });
        return (
            <div className="grid-padding">
                <h1 className="tmp-feed-h1">Majority Feed</h1>
                <div className="masonry" ref="masonryContainer" id="asyncPosts">
                    <div className="backdrop"></div>
                    <div className="grid-sizer" style={{"display": "none"}}></div>
                    {posts}
                </div>
            </div>
        );
    },
});

module.exports = Feed;
