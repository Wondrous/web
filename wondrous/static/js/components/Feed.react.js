var Post = require('./Post/Post.react');

var FeedStore = require('../stores/FeedStore');
var UserStore = require('../stores/UserStore');
var WondrousActions = require('../actions/WondrousActions');
var MasonryMixin = require('../vendor/masonry.mixin');
var checkLogin = require('../utils/Func').checkLogin;

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
        if (!UserStore.loaded){
            return (<div></div>);
        }

        return (
            <div>
                <Feed />
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

    checkForParams: function(){
        var post_id = this.getParams().post_id;
        if (typeof post_id !== 'undefined'){
            WondrousActions.newPostLoad(post_id);
        }
    },


    getInitialState: function() {
        this.checkForParams();
        return {data: FeedStore.getFeed(), paging: false};
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
        console.log(posts);
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
                    {!FeedStore.donePaging&&posts.length>0?<img className="loading-wheel" src="/static/pictures/p.loading.gif"/>:{}}
                    {UserStore.loaded&&!UserStore.loggedIn?<a onClick={this.promptSignup}><h1>Load More</h1></a>:{}}
                    </div>
                </div>
            </div>
        );
    },
});

var LoggedOut = React.createClass({
    clearModals: function(){
        WondrousActions.clearModal();
    },
    render: function(){
        var timeNow = new Date();

        var openSignUp = timeNow>= new Date(2015,5,1,0,0,0);
        return (
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "maxWidth": "730px", "top": "10%"}}>
                <img src="/static/pictures/p.logo.png" style={{"width": "350px", "height": "auto"}}/>
                <p style={{"fontFamily": "helvetica, arial, sans-serif","color": "rgb(71,71,71)","fontSize": "20px","fontWeight": "100","width": "75%","margin": "20px auto"}}>
                    Some amazing slogan goes here to fill up space on our temporary home page
                </p>
                <div style={{"padding": "40px 0"}}>
                {openSignUp?<Link className="index-lo-big-link signup-big-link round-5" to="signup" onClick={this.clearModals}>Sign up</Link>:
                <Link className="index-lo-big-link signup-big-link round-5" to="landingBare" onClick={this.clearModals}>Join the line!</Link>}
                    <Link className="index-lo-big-link blue-big-link round-3" to="login" onClick={this.clearModals}>Log in</Link>
                </div>
            </div>
        );
    }
})

module.exports = {Home:Home,LoggedOut:LoggedOut};
