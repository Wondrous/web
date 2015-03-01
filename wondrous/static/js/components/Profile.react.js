var Post = require('./Post.react');
var PostForm = require('./PostForm.react');
var WallStore = require('../stores/WallStore');
var UserStore = require('../stores/UserStore');
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
    return {data:WallStore.getWallData()};
}

var masonry = null;

var masonryOptions = {
    transitionDuration: 0,
    itemSelector: ".masonry-brick",
    columnWidth: ".grid-sizer"
};

var Wall = React.createClass({
    mixins: [MasonryMixin('masonryContainer', masonryOptions), Router.State],

    getInitialState: function() {
        return getWallPosts();
    },

    componentDidMount: function() {
        WallStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function(){
        WallStore.removeChangeListener(this._onChange);
    },
    showNewPost: function(e) {
        WondrousActions.toggleNewPostModal();
    },
    render: function() {
        var am_following = getProfileState().data.following;
        var is_private = getProfileState().data.is_private;
        var is_visible = am_following || is_private;
        is_visible = is_visible==true;
        var posts = this.state.data.map(function(post,index){
            return(
                <Post key={post.id} data={post} />
            );
        });

        var username = this.getParams().username;
        var is_me = username === UserStore.getUserData().username;
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

function getFollower() {
    return {data:ProfileStore.getProfileFollower()};
}

var UserIcon = React.createClass({
    mixins: [ Router.Navigation ],
    handleProfileData: function(err, data) {
        if (err == null) {
            console.log("profile", data);
            WondrousActions.loadProfileInfo(data);
        } else {
            // WondrousActions.unloadUserInfo(err);
        }
    },
    handleWallData: function(err, data) {
        if (err == null) {
            WondrousActions.loadWallPosts(data);
        } else {

        }
    },
    loadProfileFromServer: function() {
        WondrousAPI.getUserInfo({
            username: this.props.user.username,
            callback: this.handleProfileData
        });
    },
    loadWallFromServer: function() {
        WondrousAPI.getWallPosts({
            username: this.props.user.username,
            page:0,
            callback: this.handleWallData
        });
    },
    handleClick: function() {
        this.transitionTo('/' + this.props.user.username);
        this.loadProfileFromServer();
        this.loadWallFromServer();
    },
    render: function() {

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
    mixins: [ Router.State, Router.Navigation ],
    am_following:getProfileState().data.following,
    is_private:getProfileState().data.is_private,

    handleData: function(err, data) {
        if (err == null) {
            WondrousActions.loadProfileFollower(data);
        } else {
            console.error("error", err);
        }
    },
    loadFollowersFromServer: function() {
        var username = this.getParams().username;
        console.log("getting followers for",username);
        WondrousAPI.getFollowers({
            page: 0,
            username: username,
            callback: this.handleData
        });
    },
    getInitialState: function() {
        return getFollower();
    },
    componentDidMount: function() {
        ProfileStore.addChangeListener(this._onChange);
        this.loadFollowersFromServer();
    },

    componentWillUnmount: function() {
        ProfileStore.removeChangeListener(this._onChange);
    },
    handleClick: function(username) {
        return this.transitionTo('/' + username)
    },
    render: function(){
        this.am_following = getProfileState().data.following;
        this.is_private = getProfileState().data.is_private;
        var is_visible = this.am_following || this.is_private;
        var handle = this.handleClick;
        var followers = this.state.data.map(function(user, index){
            return (
                <UserIcon user={user}/>
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

function getFollowing() {
    return {data:ProfileStore.getProfileFollowing()};
}

var Following = React.createClass({
    mixins: [ Router.State, Router.Navigation ],
    am_following:getProfileState().data.following,
    is_private:getProfileState().data.is_private,

    handleData: function(err, data) {
        if (err == null){
            WondrousActions.loadProfileFollowing(data);
        } else {
            console.error("error", err);
        }
    },
    loadFollowingFromServer: function() {
        var username = this.getParams().username;
        WondrousAPI.getFollowing({
            page: 0,
            username: username,
            callback: this.handleData
        });
    },
    getInitialState: function() {
        return getFollowing();
    },
    componentDidMount: function() {
        ProfileStore.addChangeListener(this._onChange);
        this.loadFollowingFromServer();
    },

    componentWillUnmount: function() {
        ProfileStore.removeChangeListener(this._onChange);
    },
    render: function() {
        this.am_following = getProfileState().data.following;
        this.is_private = getProfileState().data.is_private;
        var is_visible = this.am_following || this.is_private;

        var following = this.state.data.map(function(user, index){
            return (
                <UserIcon user={user} />
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

function getProfileState() {
    return {data:ProfileStore.getProfileData()};
}

var UserBar = React.createClass({
    mixins: [ Router.Navigation ],

    am_following: getProfileState().data.following,
    is_private: getProfileState().data.is_private,

    getInitialState: function() {
        return getProfileState();
    },
    componentDidMount: function() {
        ProfileStore.addChangeListener(this._onChange);
        if(UserStore.getUserData().username===this.props.username){
            UserStore.addChangeListener(this._onChange);
        }
    },

    componentWillUnmount: function() {
        ProfileStore.removeChangeListener(this._onChange);
        if(UserStore.getUserData().username===this.props.username){
            UserStore.removeChangeListener(this._onChange);
        }
    },
    getInitialState: function() {
        return getProfileState();
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
        user_id = getProfileState().data.id;
        if (!user_id && typeof user_id === 'undefined') return;

        WondrousAPI.toggleFollow({
            user_id:user_id,
            callback:this.handleData
        })
    },

    handleClick: function(){
        WondrousActions.togglePictureUpload();
    },

    render: function() {
        var username = this.props.username;
        this.is_private = getProfileState().data.is_private;
        this.am_following = getProfileState().data.following==true;
        var is_me = username === UserStore.getUserData().username;

        var ouuid = (typeof getProfileState().data.ouuid !== 'undefined') ? getProfileState().data.ouuid : false;
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
                <img className="profile-photo round-50" onClick={this.handleClick} src={img_src} />
                <div className="profile-header-content">
                    <div className="profile-name">{this.state.data.name}</div>
                    <div className="profile-username">@{this.state.data.username}</div>
                    {/*<span className="profile-wscore">
                        <span className="profile-wscore-text round-5">1</span>
                    </span>*/}
                    {!is_me ? <button className={classes} style={{marginTop: 12}} onClick={this.handleFollow}>{btnTitle}</button> : null}
                </div>
                <hr className="profile-hr" />
                <ul className="profile-header-nav">
                    <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link" to="user" params={{username: username}}>
                        <li className="profile-header-nav-item round-50">
                            <div className="profile-header-nav-title">posts</div>
                            <span className="profile-header-nav-number">10</span>
                        </li>
                    </Link>
                    <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link " to="followers" params={{username: username}}>
                        <li className="profile-header-nav-item round-50">
                            <div className="profile-header-nav-title">followers</div>
                            <span className="profile-header-nav-number">3</span>
                        </li>
                    </Link>
                    <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link " to="following" params={{username: username}}>
                        <li className="profile-header-nav-item round-50">
                            <div className="profile-header-nav-title">following</div>
                            <span className="profile-header-nav-number">3</span>
                        </li>
                    </Link>
                    <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link " to="likes" params={{username: username}}>
                        <li className="profile-header-nav-item round-50">
                            <div className="profile-header-nav-title">clout</div>
                            <span className="profile-header-nav-number">34</span>
                        </li>
                    </Link>
                </ul>
            </div>
        );
    },
    _onChange: function() {
        this.setState({data:getProfileState().data});
    }
});

var PrivateProfile = React.createClass({

    am_following: getProfileState().data.following,
    is_private: getProfileState().data.is_private,

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
                    {/*<span className="profile-wscore">
                        <span className="profile-wscore-text round-5">1</span>
                    </span>*/}
                    <button className={classes} style={{marginTop: 12}} onClick={this.handleClick} ref="requestBtn">Request to Follow</button>
                </div>
                <hr className="profile-hr" />
                <ul className="profile-header-nav">
                    <span className="profile-header-nav-link">
                        <li className="profile-header-nav-item round-50">
                            <div className="profile-header-nav-title">posts</div>
                            <span className="profile-header-nav-number">10</span>
                        </li>
                    </span>
                    <span className="profile-header-nav-link">
                        <li className="profile-header-nav-item round-50">
                            <div className="profile-header-nav-title">followers</div>
                            <span className="profile-header-nav-number">3</span>
                        </li>
                    </span>
                    <span className="profile-header-nav-link">
                        <li className="profile-header-nav-item round-50">
                            <div className="profile-header-nav-title">following</div>
                            <span className="profile-header-nav-number">3</span>
                        </li>
                    </span>
                    <span className="profile-header-nav-link">
                        <li className="profile-header-nav-item round-50">
                            <div className="profile-header-nav-title">clout</div>
                            <span className="profile-header-nav-number">34</span>
                        </li>
                    </span>
                </ul>
            </div>
        );
    }
});

var Profile = React.createClass({
    mixins: [Router.Navigation, Router.State],
    getInitialState: function() {
        return getProfileState();
    },
    handleProfileData: function(err, data) {
        if (err == null) {
            console.log("profile", data);
            WondrousActions.loadProfileInfo(data);
        } else {
            this.replaceWith('/')
            console.error("error", err);
        }
    },
    handleWallData: function(err, data) {
        if (err == null) {
            WondrousActions.loadWallPosts(data);
        } else {
            // Nothing much happening here...
        }
    },
    loadProfileFromServer: function() {
        WondrousAPI.getUserInfo({
            username: this.getParams().username,
            callback: this.handleProfileData
        });
    },
    loadWallFromServer: function() {
        WondrousAPI.getWallPosts({
            username: this.getParams().username,
            page: 0,
            callback: this.handleWallData
        });
    },
    componentDidMount: function() {
        ProfileStore.addChangeListener(this._onChange);

        this.loadProfileFromServer();
        this.loadWallFromServer();
    },

    componentWillUnmount: function() {
        ProfileStore.removeChangeListener(this._onChange);

    },
    render: function () {
        var username = this.getParams().username;
        var am_following = getProfileState().data.following;
        var is_private = getProfileState().data.is_private;
        var is_visible = (typeof am_following !== 'undefined' && am_following == true) || (typeof is_private !== 'undefined' && !is_private == true);
        var loaded = (typeof this.state.data.is_private !== 'undefined');
        var style = {display: 'none'};

        // we don't load until we are loaded :)
        if (loaded) {
            style.display = 'block';
        }

        return (
            <div className="main-content" style={style}>

                {!is_visible ? <PrivateProfile user={getProfileState().data} /> :
                    <div>
                        <UserBar username={username} />
                        <div className="cover profile-content">
                            <PostForm />
                            <RouteHandler />
                        </div>
                    </div>
                }
            </div>);
    },
    _onChange: function(){
        this.setState(getProfileState());
    }
});

var ProfileRoute = (
    <Route name="user" path="/:username" handler={Profile}>
        <Route name="followers" path="/:username/followers" handler={Follower} />
        <Route name="following" path="/:username/following" handler={Following} />
        <Route name="likes" path="/:username/likes" />
        <DefaultRoute handler={Wall} />
    </Route>
);
module.exports = ProfileRoute;
