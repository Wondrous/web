var Post = require('../Post/Post.react');

var FeedStore = require('../../stores/FeedStore');
var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');
var ModalStore = require('../../stores/ModalStore');
var WondrousActions = require('../../actions/WondrousActions');
var MasonryMixin = require('../../vendor/masonry.mixin');
var checkLogin = require('../../utils/Func').checkLogin;
var DiscoveryBox = require('../Box/DiscoveryBox.react');
var InformationBanner = require('../InformationBanner.react');

var masonryOptions = {
    transitionDuration: 0,
    itemSelector: ".masonry-brick",
    columnWidth: ".grid-sizer"
};

var Feed = React.createClass({
    post_id: null,
    contextTypes: {
        router: React.PropTypes.func
    },
    mixins: [
        MasonryMixin('masonryContainer', masonryOptions),
        Reflux.listenTo(FeedStore,'onFeedUpdate'),
        Reflux.listenTo(UserStore,'onUserUpdate'),
        Reflux.listenTo(ModalStore,'onModalUpdate')
    ],

    checkForParams: function(){
        this.post_id = (typeof this.context.router.getCurrentParams().post_id !=='undefined')?this.context.router.getCurrentParams().post_id:null;
        if (typeof this.post_id !== 'undefined' && this.post_id!=null){
            WondrousActions.newPostLoad(this.post_id);
        }
    },

    getInitialState: function() {
        this.checkForParams();
        return {data: FeedStore.feed.sortedSet};
    },

    onModalUpdate: function(){
        if(!ModalStore.cardOpen&&this.post_id!=null){
            this.post_id=null;
            this.context.router.transitionTo('/');
        }
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

        var ouuid = (typeof UserStore.user.ouuid !== 'undefined') ? UserStore.user.ouuid : null;

        if (!UserStore.loggedIn && UserStore.loaded) {
            return (
                <div className="masonry" ref="masonryContainer" id="asyncPosts">
                    <div className="backdrop"></div>
                    <div className="grid-sizer" style={{"display": "none"}}></div>
                </div>
            );
        }

        var posts = this.state.data.map(function(post, index) {
            if (index != 2) {
                return (
                    <Post key={post.id} data={post}/>
                );
            } else {
                return (
                    <span>
                        <div ref="brick" className="masonry-brick">
                            <DiscoveryBox />
                        </div>
                        <Post key={post.id} data={post}/>
                    </span>
                );
            }
        });

        if (posts.length < 3) {
            posts.push((
                <span>
                    <div ref="brick" className="masonry-brick">
                        <DiscoveryBox />
                    </div>
                </span>
            ));
        }

        updateBannerStyles = { cursor: "pointer" };
        if (!ouuid) {
            updateBannerStyles['marginTop'] = 20;
        }

        return (
            <span>
                {!ouuid ?
                    <InformationBanner
                        bannerType="alert"
                        actionType="uploadProfilePicture"
                        canExit="false"
                        text="Don't forget to upload a profile photo!"
                        styles={{ cursor: "pointer", margin: 0 }}
                        />
                    : null}
                <div className="grid-padding">
                    <div ref="scrollBox">
                        {/*
                        <InformationBanner
                            actionType="loadPost" 
                            bannerType="general" 
                            canExit="false" 
                            text="While you were gone, here are some things we've done to the site..." 
                            styles={updateBannerStyles}
                            />
                        */}

                        {FeedStore.hasNewPosts ?
                            <button className="load-new-posts-btn round-2" onClick={FeedStore.loadNewest}>
                                Load new posts
                            </button>
                            : null}

                        {FeedStore.loaded && posts.length < 3 ?
                            <div style={{ paddingTop: 20 }}>
                                <DiscoveryBox />
                                {posts.length == 0 ?
                                    <div className="no-data-to-display">
                                        There are no posts in your feed yet
                                    </div>
                                    : null }
                            </div>
                            : null}

                        <div className="masonry" ref="masonryContainer" id="asyncPosts">
                            <div className="backdrop"></div>
                            <div className="grid-sizer" style={{"display": "none"}}></div>
                            {posts}
                        </div>
                        <div>
                        {!FeedStore.donePaging&&posts.length>0&&UserStore.loggedIn?<img className="loading-wheel" src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/p.loading.gif"/>:{}}
                        {UserStore.loaded&&!UserStore.loggedIn?<a onClick={this.promptSignup}><h1>Load More</h1></a>:{}}
                        </div>
                    </div>
                </div>
            </span>
        );
    },
});


module.exports = Feed;
