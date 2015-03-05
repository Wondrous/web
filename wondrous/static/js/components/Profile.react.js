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

function getWallPosts() {
    return {data:WallStore.getWall()};
}

var masonry = null;

var masonryOptions = {
    transitionDuration: 0,
    itemSelector: ".masonry-brick",
    columnWidth: ".grid-sizer"
};

var Wall = React.createClass({
    mixins: [MasonryMixin('masonryContainer', masonryOptions), Router.State, Reflux.connect(WallStore,"data")],

    getInitialState: function() {
        return getWallPosts();
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
                <div className="backdrop"></div>
                <div className="grid-sizer" style={{"display": "none"}}></div>
                    {posts}
                </div>
            </div>
        );
    },
    _onChange: function() {
        this.setState(getWallPosts());
    }
});


var UserIcon = React.createClass({
    mixins: [ Router.Navigation ],

    handleClick: function() {
        this.transitionTo('/' + this.props.user.username);
    },
    render: function() {
        var is_me = this.props.username === UserStore.user.username;
        return (
            <a onClick={this.handleClick}>
                <div>
                    <img src={(typeof this.props.user.ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/" + this.props.user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg"} className="profile-photo-med round-50"/>
                    <span className="profile-name-row">{ this.props.user.name }</span>
                </div>
            </a>
        );
    }
});

var Follower = React.createClass({
    mixins: [ Router.State, Router.Navigation , Reflux.listenTo(ProfileStore,"onProfileChange")],
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,
    onProfileChange: function(profileData){
        this.setState({data:ProfileStore.followers});
    },
    getInitialState: function() {
        WondrousActions.loadFollower(ProfileStore.user.username,ProfileStore.follower_page);
        return {data:ProfileStore.followers};
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
        })
        return (
            <div>
                {followers}
            </div>
        );
    },
    _onChange: function() {
        this.setState(getFollower());
    }
});


var Following = React.createClass({
    mixins: [ Router.State, Router.Navigation, Reflux.listenTo(ProfileStore,"onProfileChange") ],
    onProfileChange: function(profileData){
        this.setState({data:ProfileStore.following});
    },
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    getInitialState: function() {
        WondrousActions.loadFollowing(ProfileStore.user.username,ProfileStore.following_page);
        return {data:ProfileStore.following};
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
            <div>
                {following}
            </div>
        );
    },
    _onChange:function() {
        this.setState(getFollowing());
    }
});

var ProfileBarBadge = React.createClass({
    render: function(){
        return (
            <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link " to={this.props.to} params={{username: this.props.username}}>
                <li className="profile-header-nav-item round-50">
                    <div className="profile-header-nav-title">{this.props.name}</div>
                    <span className="profile-header-nav-number">{this.props.number}</span>
                </li>
            </Link>
        );
    }
})

var UserBar = React.createClass({
    mixins: [ Router.Navigation, Reflux.listenTo(ProfileStore,'onProfileChange')],

    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    onProfileChange: function(){
        this.setState({data:ProfileStore.user});
    },
    getInitialState: function() {
        return {data:ProfileStore.user};
    },

    handleData: function(err, data) {
        if (err == null){
            var currentState = this.state.data;
            currentState.following = data.following == true;

            this.setState({data:currentState});
        } else{
            console.error("error", err);
        }
    },
    handleFollow: function() {
        user_id = ProfileStore.user.id;
        if (!user_id && typeof user_id === 'undefined') return;

        WondrousAPI.toggleFollow({
            user_id:user_id,
            callback:this.handleData
        })
    },

    handleClick: function() {
        var is_me = this.props.username === UserStore.user.username;
        console.log("me",this.props.username, UserStore.user.username);
        if (is_me) {
            WondrousActions.togglePictureModal();
        }
    },

    render: function() {
        var username = this.props.username;
        this.is_private = ProfileStore.user.is_private;
        this.am_following = ProfileStore.user.following==true;
        var is_me = username === UserStore.user.username;

        var ouuid = (typeof ProfileStore.user.ouuid !== 'undefined') ? ProfileStore.user.ouuid : false;
        var img_src = ouuid ? "http://mojorankdev.s3.amazonaws.com/"+ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";

        var classes = "follow-button round-2 ";
        if (this.am_following) {
            var btnTitle = "Following";
            classes += "is-following";
        } else {
            var btnTitle = "Follow";
            classes += "not-following";
        }

        return (
            <div className="profile-header">
                <img className="profile-photo round-50" style={is_me ? {cursor: 'pointer'} : {}} onClick={this.handleClick} src={img_src} />
                <div className="profile-header-content">
                    <div className="profile-name">{this.state.data.name}</div>
                    <div className="profile-username">@{this.state.data.username}</div>

                    {!is_me ? <button className={classes} style={{marginTop: 12}} onClick={this.handleFollow}>{btnTitle}</button> : null}
                </div>
                <hr className="profile-hr" />
                <ul className="profile-header-nav">
                    <ProfileBarBadge to={"wall"} name={"posts"} number={this.state.data.post_count} username={this.state.data.username} />
                    <ProfileBarBadge to={"followers"} name={"followers"} number={this.state.data.follower_count-1} username={this.state.data.username} />
                    <ProfileBarBadge to={"following"} name={"following"} number={this.state.data.following_count-1} username={this.state.data.username} />
                    <ProfileBarBadge to={"wall"} name={"clout"} number={32} username={this.state.data.username} />
                </ul>
            </div>
        );
    }
});

var PrivateProfile = React.createClass({
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    handleData: function(err, data){
        if (err == null){
            $(this.refs.requestBtn.getDOMNode()).html('request sent!');
            $(this.refs.requestBtn.getDOMNode()).prop("disabled", true);
        } else {
            console.error("error", err);
        }
    },
    handleClick :function(){
        user_id = this.props.user.id;
        console.log("sending", this.props.user);

        if(!user_id && typeof user_id === 'undefined') return;
        WondrousAPI.toggleFollow({
            user_id:user_id,
            callback:this.handleData
        })
    },
    render: function() {
        var img_src = (typeof this.props.user.ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/" + this.props.user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg";

        var classes = "follow-button round-2 ";
        if (this.am_following) {
            var btnTitle = "Following";
            classes += "is-following";
        } else {
            var btnTitle = "Follow";
            classes += "not-following";
        }

        return (
            <div className="profile-header">
                <img className="profile-photo round-50" src={img_src} />
                <div className="profile-header-content">
                    <div className="profile-name">{this.props.user.name}</div>
                    <div className="profile-username">@{this.props.user.username}</div>
                    <button className={classes} style={{marginTop: 12}} onClick={this.handleClick} ref="requestBtn">Request to Follow</button>
                </div>
            </div>
        );
    }
});

var Profile = React.createClass({
    mixins: [Router.Navigation, Router.State, Reflux.listenTo(ProfileStore,"onProfileChange")],
    onProfileChange: function(){
        if (!UserStore.loggedIn){
            this.transitionTo('/');
        }else{

            this.forceUpdate();
        }
    },

    render: function () {
        var username = this.getParams().username;
        var am_following = ProfileStore.user.following;
        var is_private = ProfileStore.user.is_private;
        var is_visible = (typeof am_following !== 'undefined' && am_following == true) || (typeof is_private !== 'undefined' && !is_private == true);
        var loaded = (typeof ProfileStore.user.is_private !== 'undefined');
        var style = {display: 'none'};

        // we don't load until we are loaded :)
        if (loaded) {
            style.display = 'block';
        }

        if(ProfileStore.user.username !== username){
            WondrousActions.loadProfile(username);
            WondrousActions.loadWall(username,ProfileStore.current_page);
        }

        return (
            <div className="main-content" style={style}>

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
    <Route name="user" path="/:username" handler={Profile}>
        <Route name="wall" handler={Wall}/>
        <Route name="followers" path="/:username/followers" handler={Follower} />
        <Route name="following" path="/:username/following" handler={Following} />
        <Route name="likes" path="/:username/likes" />
        <DefaultRoute handler={Wall} />
    </Route>
);
module.exports = ProfileRoute;
