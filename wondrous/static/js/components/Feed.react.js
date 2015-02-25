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

var masonry = null;

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

        if (masonry==null){
            var container = document.querySelector('.masonry');
            masonry = new Masonry(container, {
                  transitionDuration : 0.5,
                  itemSelector       : ".masonry-brick",
                  columnWidth        : 288,
            });
        }
    },
    toggleMasonry:function(){
        masonry.layout();
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
                <Post key={post.id} data={post} toggle={this.toggleMasonry}/>
            );
        });

        return (
            <div className="grid-padding">
                <h1 className="tmp-feed-h1">Main Feed</h1>
                <div className="masonry" id="asyncPosts">
                    <div className="backdrop"></div>
                    <div className="grid-sizer" style={{"display": "none"}}></div>
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
