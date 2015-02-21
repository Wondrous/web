var Post = require('./Post.react');
var FeedStore = require('../stores/FeedStore');
var UserStore = require('../stores/UserStore');
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');

// Method to retrieve state from stores
function getFeedState() {
    var data = FeedStore.getFeed();
    return data;
}

var Feed = React.createClass({
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
    // Remove change listeners from stores
    componentWillUnmount: function() {
        FeedStore.removeChangeListener(this._onChange);
        UserStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var posts = this.state.data.map(function(post, index) {
            return (
                <Post key={post.id} data={post} />
            );
        });

        return (
            <div className="grid-padding">
                <div className="masonry" id="asyncPosts">
                    <div className="backdrop"></div>
                    <div className="grid-sizer" style={{"display": "none"}}></div>

                    <h1 className="tmp-feed-h1">Main Feed</h1>
                    {posts}
                </div>
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
