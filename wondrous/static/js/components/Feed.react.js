var Post = require('./Post.react');
var FeedStore = require('../stores/FeedStore');
var UserStore = require('../stores/UserStore');
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var MasonryMixin = require('../vendor/masonry.mixin');

// Method to retrieve state from stores
function getFeedState() {
    var data = FeedStore.getFeed();
    return data;
}

var masonry = null;

var masonryOptions = {
    transitionDuration: 0,
    columnWidth: 80
};

var Feed = React.createClass({
    // mixins: [MasonryMixin('masonryContainer', masonryOptions)],
    handleData: function(err, data) {
        if (err == null) {
            WondrousActions.loadToFeed(data);
        } else {
            console.error("error", err);
        }
    },
    loadFeedFromServer: function() {
        WondrousAPI.getMajorityPosts({
            page: 0,
            callback: this.handleData
        });
    },
    getInitialState: function() {
        this.loadFeedFromServer();
        return {'data': getFeedState()};
    },
    // Add change listener to stores
    componentDidMount: function() {
        FeedStore.addChangeListener(this._onChange);
        UserStore.addChangeListener(this._onChange);
    },

    componentDidUpdate:function(){

    },
    // Remove change listeners from stores
    componentWillUnmount: function() {
        FeedStore.removeChangeListener(this._onChange);
        UserStore.removeChangeListener(this._onChange);
    },
    render: function() {
        console.log("will update");

        var posts = this.state.data.map(function(post, index) {
            return (
                <Post key={post.id} data={post} />
            );
        });

        return (
            <div className="grid-padding">
                <h1 className="tmp-feed-h1">Main Feed</h1>
                <div className="masonry" ref="masonryContainer" id="asyncPosts">
                    <div className="backdrop"></div>
                    <div className="grid-sizer" style={{"display": "none"}}></div>
                    {posts}
                </div>
                <div>Loading more</div>
            </div>
        );
    },

    // Method to setState based upon Store changes
    _onChange: function() {
        var data = getFeedState();
        this.setState({data:data});
    }
});

module.exports = Feed;
