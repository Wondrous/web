var Post = require('./Post.react');
var PostForm = require('./PostForm.react');
var UserStore = require('../stores/UserStore');
var WallStore = require('../stores/WallStore');
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var ProfileStore = require('../stores/ProfileStore');
var RouteHandler = require('react-router').RouteHandler;
var DefaultRoute = require('react-router').DefaultRoute;
var Route = require('react-router').Route;
var Link = Router.Link;
var MasonryMixin = require('../vendor/masonry.mixin');

var WondrousAPI = require('../utils/WondrousAPI');
var MouseWheel = require('kd-shim-jquery-mousewheel');
var CropBox = require('jquery-cropbox');

// Components
var masonry = null;

var masonryOptions = {
    transitionDuration: 0,
    itemSelector: ".masonry-brick",
    columnWidth: ".grid-sizer"
};

var Wall = React.createClass({
    mixins: [MasonryMixin('masonryContainer', masonryOptions), Router.State, Reflux.connect(WallStore,"data")],
    componentDidMount: function(){
        WondrousActions.wallLoaded();
    },
    getInitialState: function() {
        return {data:WallStore.getWall()};
    },

    showNewPost: function(e) {
        WondrousActions.togglePostModal();
    },
    render: function() {
        var am_following = ProfileStore.user.following;
        var is_private = ProfileStore.user.is_private;
        var is_visible = am_following || is_private;
        is_visible = is_visible==true;
        // console.log("rendering post",this.state.data);
        var posts = this.state.data.map(function(post,index){
            return(
                <Post key={post.id} data={post} />
            );
        });
        var username = this.getParams().username;
        var is_me = username === UserStore.user.username;
        return (
            <div>
                {is_me ? <div onClick={this.showNewPost} id="new-post-launch" className="round-2">Make a new post</div> : null}
                <div className="masonry" ref="masonryContainer" id="asyncPosts">
                <div className="--backdrop"></div>
                <div className="grid-sizer" style={{  display: "none" }}></div>
                    {posts}
                </div>
                <div>
                {!WallStore.donePaging&&posts.length>0?<img className="loading-wheel" src="/static/pictures/p.loading.gif"/>:null}
                </div>
            </div>
        );
    }
});

var InfluencerBadge = React.createClass({

    render: function() {

        var size = this.props.size;
        styleAdjustmentsWrapper = null;
        styleAdjustmentsCheckmark = null;

        if (size == "small") {
            styleAdjustmentsWrapper = { fontSize: 11, fontWeight: 400, padding: "2px 6px", borderWidth: 1 };
            styleAdjustmentsCheckmark = { marginLeft: 3, fontSize: 11 };
        }

        return (
            <div className="profile-badge-influencer round-2" style={styleAdjustmentsWrapper}>
                Influencer
                <span className="profile-badge-influencer--checkmark" style={styleAdjustmentsCheckmark}>O</span>
            </div>
        );
    }
});


var UserIcon = React.createClass({
    mixins: [ Router.Navigation ],

    render: function() {
        var is_influencer = $.inArray(0, this.props.user.badges) != -1;
        var hrefPlaceholder = "/" + this.props.user.username;
        return (
            <li className="user-itemizer">
                <Link className="avatar" to={hrefPlaceholder}>
                    <img className="profile-photo-med round-50" src={(typeof this.props.user.ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/" + this.props.user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg"} />
                </Link>
                <div className="user-itemizer-data">
                    <Link className="user-itemizer-data-name" to={hrefPlaceholder} >{ this.props.user.name }</Link>
                    <div className="user-itemizer-data-desc">
                        @{ this.props.user.username }
                    </div>
                    {is_influencer ?
                        <InfluencerBadge size="small" />
                        : null}
                </div>
            </li>
        );
    }
});

var Follower = React.createClass({
    mixins: [
        Router.State,
        Router.Navigation,
        Reflux.listenTo(ProfileStore,"onProfileChange")
    ],
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    onProfileChange: function(profileData){
        if (profileData.hasOwnProperty('followers')){
            this.setState({data:profileData.followers});
        }else{
            WondrousActions.loadFollower(ProfileStore.user.username,ProfileStore.followerPage);
        }
    },

    getInitialState: function() {
        WondrousActions.loadFollower(ProfileStore.user.username, ProfileStore.followerPage);
        return {data:ProfileStore.followers.sortedSet};
    },

    handleClick: function(username) {
        return this.transitionTo('/' + username)
    },
    render: function(){
        this.am_following = ProfileStore.user.following;
        this.is_private = ProfileStore.user.is_private;
        var is_visible = this.am_following || this.is_private;
        var handle = this.handleClick;
        var followers = this.state.data.map(function(user, index){
            return (
                <UserIcon key={user.id} user={user}/>
            );
        });

        return (
            <ul className="item-ul">
                {followers}
            </ul>
        );
    },
    _onChange: function() {
        this.setState(getFollower());
    }
});


var Following = React.createClass({
    mixins: [ Router.State, Router.Navigation, Reflux.listenTo(ProfileStore,"onProfileChange") ],
    onProfileChange: function(profileData){
        if (profileData.hasOwnProperty('following')){
            this.setState({data:profileData.following});
        }else{
            WondrousActions.loadFollowing(ProfileStore.user.username,ProfileStore.followingPage);
        }
    },
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    getInitialState: function() {
        WondrousActions.loadFollowing(ProfileStore.user.username,ProfileStore.followingPage);
        return {data:ProfileStore.following.sortedSet};
    },

    render: function() {
        this.am_following = ProfileStore.user.following;
        this.is_private = ProfileStore.user.is_private;
        var is_visible = this.am_following || this.is_private;

        var following = this.state.data.map(function(user, index){
            return (
                <UserIcon key={user.id} user={user} />
            );
        })
        return (
            <ul className="item-ul">
                {following}
            </ul>
        );
    },
    _onChange:function() {
        this.setState(getFollowing());
    }
});

var ProfileBarBadge = React.createClass({
    render: function() {
        var isInfluencer = null;
        if (this.props.name == "influence") {
            isInfluencer = this.props.number >= 75 ? "profile-header-nav-number--is-influencer" : null
        }

        return (
            <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link " to={this.props.to} params={{username: this.props.username}}>
                <li className="profile-header-nav-item round-50">
                    <div className="profile-header-nav-title">{this.props.name}</div>
                    <span className={isInfluencer}>{this.props.number}</span>
                </li>
            </Link>
        );
    }
})

var UserBar = React.createClass({
    mixins: [
        Router.Navigation,
        Reflux.listenTo(ProfileStore, 'onProfileChange')
    ],

    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    onProfileChange: function(profileData){
        this.setState({
            data: ProfileStore.user
        });
    },

    getInitialState: function() {
        console.log(ProfileStore.user);
        return {data: ProfileStore.user};
    },

    handleData: function(err, data) {
        if (err == null){
            var currentState = this.state.data;
            currentState.following = data.following == true;
            this.setState({data: currentState});
        } else{
            console.error("error", err);
        }
    },
    handleFollow: function() {
        user_id = ProfileStore.user.id;
        if (!user_id && typeof user_id === 'undefined') return;

        WondrousAPI.toggleFollow({
            user_id: user_id,
            callback: this.handleData
        })
    },

    handleClick: function() {
        var is_me = this.props.username === UserStore.user.username;
        if (is_me) {
            WondrousActions.togglePictureModal();
        }
    },

    render: function() {
        this.is_private = ProfileStore.user.is_private;
        this.am_following = this.state.data.following == true;
        console.log("am following?",this.am_following);
        
        var username = this.props.username;
        var is_me = username === UserStore.user.username;
        var ouuid = (typeof ProfileStore.user.ouuid !== 'undefined') ? ProfileStore.user.ouuid : false;
        var img_src = ouuid ? "http://mojorankdev.s3.amazonaws.com/"+ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
        var classes = "profile-header-nav-item follow-button round-50 ";
        var is_influencer = $.inArray(0, this.state.data.badges) != -1;

        // This is temporary...sorta
        var wondrousScore = this.state.data.wondrous_score;
        if (is_influencer && wondrousScore < 75) {
            wondrousScore = 75;
        }

        if (this.am_following) {
            var btnTitle = "following";
            classes += "is-following";
        } else {
            var btnTitle = "follow";
            classes += "not-following";
        }

        return (
            <div className="profile-header">
                <img className="profile-photo round-50" style={is_me ? {cursor: 'pointer'} : {}} onClick={this.handleClick} src={img_src} />
                <div className="profile-header-content">

                    {is_influencer ?
                        <InfluencerBadge size="large" />
                        : null}

                    <div className="profile-name">{this.state.data.name}</div>
                    <div className="profile-username">@{this.state.data.username}</div>

                </div>
                <hr className="profile-hr" />
                <ul className="profile-header-nav">
                    <ProfileBarBadge to={"wall"} name={"posts"} number={this.state.data.post_count} username={this.state.data.username} />
                    <ProfileBarBadge to={"followers"} name={"followers"} number={this.state.data.follower_count-1} username={this.state.data.username} />
                    <ProfileBarBadge to={"following"} name={"following"} number={this.state.data.following_count-1} username={this.state.data.username} />
                    <ProfileBarBadge to={"wall"} name={"influence"} number={wondrousScore} username={this.state.data.username} />

                    {!is_me ?
                        <div>
                            <li className={classes} onClick={this.handleFollow}>
                                <div className="profile-header-nav-title" style={{ color: "rgb(140,140,140)" }} >{btnTitle}</div>
                                {!this.am_following ?
                                    <span>
                                        <span className="follow-button-plus">+</span>
                                        <img style={{ display: "none"}} className="follow-button-checkmark" src="/static/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                    </span>
                                        :
                                    <span>
                                        <span style={{ display: "none"}} className="follow-button-plus">+</span>
                                        <img className="follow-button-checkmark" src="/static/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                    </span>
                                }
                            </li>
                        </div>
                        : null}
                </ul>
            </div>
        );
    }
});

var PrivateProfile = React.createClass({
    mixins: [
        Router.Navigation,
        Reflux.listenTo(ProfileStore, 'onProfileChange')
    ],
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    getInitialState: function() {
        return {data: ProfileStore.user};
    },

    handleData: function(err, data){
        if (err == null){
            $('._rmPending').hide();
            $('._pendingTitle').html("Request<br/>Sent");
            $('._requestBtn').removeClass('not-following').addClass('is-pending');
        } else {
            console.error("error", err);
        }
    },

    handleClick :function(){
        user_id = this.props.user.id;
        //console.log("sending", this.props.user);

        if (!user_id && typeof user_id === 'undefined') return;
        WondrousAPI.toggleFollow({
            user_id: user_id,
            callback: this.handleData
        })
    },
    render: function() {
        var ouuid = (typeof this.state.data.ouuid !== 'undefined') ? this.state.data.ouuid : false;
        var img_src = ouuid ? "http://mojorankdev.s3.amazonaws.com/"+ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";

        var is_influencer = $.inArray(0, this.state.data.badges) != -1;
        var wondrousScore = this.state.data.wondrous_score;
        if (is_influencer && wondrousScore < 75) {
            wondrousScore = 75;
        }

        var classes = "profile-header-nav-item follow-button round-50 _requestBtn ";
        if (this.am_following) {
            var btnTitle = "Following";
            classes += "is-following";
        } else {
            var btnTitle = "Follow";
            classes += "not-following";
        }

        return (
            <div>
                <div className="profile-header">
                    <img className="profile-photo round-50" src={img_src} />
                    <div className="profile-header-content">

                        {is_influencer ?
                            <InfluencerBadge size="large" />
                            : null}

                        <div className="profile-name">{this.props.user.name}</div>
                        <div className="profile-username">@{this.props.user.username}</div>
                    </div>
                    <hr className="profile-hr" />
                    <ul className="profile-header-nav">
                        <ProfileBarBadge to={"wall"} name={"posts"} number={this.state.data.post_count} username={this.state.data.username} />
                        <ProfileBarBadge to={"followers"} name={"followers"} number={this.state.data.follower_count-1} username={this.state.data.username} />
                        <ProfileBarBadge to={"following"} name={"following"} number={this.state.data.following_count-1} username={this.state.data.username} />
                        <ProfileBarBadge to={"wall"} name={"influence"} number={wondrousScore} username={this.state.data.username} />

                        <div>
                            <li className={classes} onClick={this.handleClick}>
                                <div className="profile-header-nav-title _pendingTitle" style={{ color: "rgb(140,140,140)" }} >{btnTitle}</div>
                                {!this.am_following ?
                                    <span className="_rmPending">
                                        <span className="follow-button-plus">+</span>
                                        <img style={{ display: "none"}} className="follow-button-checkmark" src="/static/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                    </span>
                                        :
                                    <span className="_rmPending">
                                        <span style={{ display: "none"}} className="follow-button-plus">+</span>
                                        <img className="follow-button-checkmark" src="/static/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                    </span>
                                }
                            </li>
                        </div>
                    </ul>
                </div>
                <div className="profile-content">
                    <div style={{ textAlign: "center", margin: "40px 0", color: "rgb(180,180,180)", fontWeight: 900, fontSize: 16 }}>
                        <div>This profile is private</div>
                        <div style={{ fontWeight: 400, fontSize: 14, margin: "10px 0" }}>You must be following this user to view, like, and comment on their posts</div>
                    </div>
                </div>
            </div>
        );
    }
});

var Profile = React.createClass({
    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(ProfileStore,"onProfileChange")
    ],
    
    onProfileChange: function(){
        if (!UserStore.loggedIn && UserStore.loaded) {
            this.transitionTo('/');
        } else {
            var username = this.getParams().username;
            if (ProfileStore.user.username === username){
                this.forceUpdate();
            }
        }
    },

    render: function () {
        var username = this.getParams().username;

        if(ProfileStore.user.username !== username){
            WondrousActions.newProfile(username);
            WondrousActions.loadProfile(username);
            WallStore.loadMore(username);
            return (
                <div></div>
            );
        }
        var am_following = ProfileStore.user.following;
        var is_private = ProfileStore.user.is_private;
        var is_visible = (typeof am_following !== 'undefined' && am_following == true) || (typeof is_private !== 'undefined' && !is_private == true);
        var loaded = (typeof ProfileStore.user.is_private !== 'undefined');
        var style = {display: 'none'};

        // we don't load until we are loaded :)
        if (loaded) {
            style.display = 'block';
        }
        return (
            <div style={style}>
                {!is_visible ? <PrivateProfile user={ProfileStore.user} /> :
                    <div>
                        <UserBar username={username}/>
                        <div className="cover profile-content">
                            <PostForm />
                            <RouteHandler />
                        </div>
                    </div>
                }
            </div>);
    }
});

var ProfileRoute = (
    <Route name="user" path="/:username" handler={Profile} ignoreScrollBehavior>
        <Route name="wall" path="/:username/wall" handler={Wall}  />
        <Route name="followers" path="/:username/followers" handler={Follower}  />
        <Route name="following" path="/:username/following" handler={Following}  />
        <DefaultRoute handler={Wall} />
    </Route>
);
module.exports = ProfileRoute;
