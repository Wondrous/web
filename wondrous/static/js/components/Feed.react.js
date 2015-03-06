var Post = require('./Post.react');
var FeedStore = require('../stores/FeedStore');
var UserStore = require('../stores/UserStore');
var WondrousActions = require('../actions/WondrousActions');
var MasonryMixin = require('../vendor/masonry.mixin');
var Link = Router.Link;

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

var Home = React.createClass({
    mixins: [Reflux.listenTo(UserStore,'onUserUpdate')],
    onUserUpdate: function(userData){
        this.forceUpdate();
    },
    render: function(){
        var loggedIn = UserStore.loggedIn;
        return (
            <div>
            {loggedIn ? <Feed />:<LoggedOut />}
            </div>
        );
    }
});

var Feed = React.createClass({
    mixins: [
        MasonryMixin('masonryContainer', masonryOptions),
        Reflux.listenTo(FeedStore,'onFeedUpdate'),
        Reflux.listenTo(UserStore,'onUserUpdate'),
        Router.State
    ],

    getInitialState: function() {
        console.log("post_id",this.getParams().post_id);
        return {data: FeedStore.getFeed(), paging: false};
    },

    onFeedUpdate: function(posts){
        this.setState({data:posts})
    },

    onUserUpdate: function(userData){
        this.forceUpdate();
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
                <div>
                    <h1 className="tmp-feed-h1">Majority Feed</h1>
                    <div className="masonry" ref="masonryContainer" id="asyncPosts">
                        <div className="backdrop"></div>
                        <div className="grid-sizer" style={{"display": "none"}}></div>
                        {posts}
                    </div>
                </div>
            </div>
        );
    },
});

var LoggedOut = React.createClass({
    render: function(){
        return (
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "maxWidth": "730px", "top": "10%"}}>
                <img src="/static/pictures/p.logo.png" style={{"width": "350px", "height": "auto"}}/>
                <p style={{"fontFamily": "helvetica, arial, sans-serif","color": "rgb(71,71,71)","fontSize": "20px","fontWeight": "100","width": "75%","margin": "20px auto"}}>
                    Some amazing slogan goes here to fill up space on our temporary home page
                </p>
                <div style={{"padding": "40px 0"}}>
                    <Link className="index-lo-big-link signup-big-link round-5" to="signup">Sign up</Link>
                    <Link className="index-lo-big-link blue-big-link round-3" to="login">Log in</Link>
                </div>
            </div>
        );
    }
})

module.exports = Home;
