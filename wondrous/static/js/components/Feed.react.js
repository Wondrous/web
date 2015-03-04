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
    itemSelector: ".masonry-brick",
    columnWidth: ".grid-sizer"
};

var Feed = React.createClass({
    paging: false,
    donePaging: false,
    mixins: [MasonryMixin('masonryContainer', masonryOptions)],
    
    handleData: function(err, data) {
        if (err == null) {
            if (data.length == 0) {
                this.donePaging = true;
            }
            WondrousActions.loadToFeed(data);
        } else {
            console.error("error", err);
        }
        this.paging = false;
    },
    loadFeedFromServer: function() {
        WondrousAPI.getMajorityPosts({
            page: 0,
            callback: this.handleData
        });
    },
    getInitialState: function() {
        this.loadFeedFromServer();
        return {'data': getFeedState(), paging: false};
    },

    checkWindowScroll: function(){
        // Get scroll pos & window data
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var s = document.body.scrollTop;
        var scrolled = (h + s) > document.body.offsetHeight;

        // If scrolled enough, not currently paging and not complete...
        if(scrolled && !this.paging && !this.donePaging) {

          // Set application state (Paging, Increment page)
          // Get the next page of posts from the server
          console.log("getting more page")
          this.paging = true;
          FeedStore.incrementPage();
          WondrousAPI.getMajorityPosts({
              page: FeedStore.getCurrentPage(),
              callback: this.handleData
          });
        }
      },
    // Add change listener to stores
    componentDidMount: function() {
        FeedStore.addChangeListener(this._onChange);
        UserStore.addChangeListener(this._onChange);

        // Attach scroll event to the window for infinity paging
        window.addEventListener('scroll', this.checkWindowScroll);
    },

    // Remove change listeners from stores
    componentWillUnmount: function() {
        FeedStore.removeChangeListener(this._onChange);
        UserStore.removeChangeListener(this._onChange);
    },
    // toggleUpdate:function(){
    //     this.masonry.reloadItems();
    //     this.masonry.layout();
    // },
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

    // Method to setState based upon Store changes
    _onChange: function() {
        var data = getFeedState();
        this.setState({data:data});
        //this.masonry.layout();
    }
});

module.exports = Feed;
