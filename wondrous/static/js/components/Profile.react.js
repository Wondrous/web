var Post = require('./Post.react');
var WallStore = require('../stores/WallStore');
var UserStore = require('../stores/UserStore');
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var ProfileStore = require('../stores/ProfileStore');
var RouteHandler = require('react-router').RouteHandler;
var DefaultRoute = require('react-router').DefaultRoute;
var Route = require('react-router').Route;

// Components
var PostForm = require('./PostForm.react');

function getWallPosts(){
    return {data:WallStore.getWallData()};
}

var Wall = React.createClass({
    mixins: [ Router.State ],

    getInitialState: function() {
        return getWallPosts();
    },

    componentDidMount: function() {
        WallStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function(){
        WallStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var posts = this.state.data.map(function(post,index){
            return(
                <Post key={post.id} data={post}/>
            );
        });

        var username = this.getParams().username;
        var is_me = username === UserStore.getUserData().username;
        return (
            <div>
                {is_me?<PostForm />:null}
                <div className="masonry" id="asyncPosts">
                    {posts}
                </div>
            </div>
        );
    },
    _onChange: function(){
        this.setState(getWallPosts());
    }
});

function getFollower(){
    return {data:ProfileStore.getProfileFollower()};
}

var Follower = React.createClass({
    mixins: [ Router.State ],

    handleData: function(err,data){
        if(err==null){
            WondrousActions.loadProfileFollower(data);
        }else{
            console.error("error",err);
        }
    },
    loadFollowersFromServer: function(){
        var username = this.getParams().username;
        WondrousAPI.getFollowers({
            page:0,
            username:username,
            callback:this.handleData
        });
    },
    getInitialState: function() {
        return getFollower();
    },
    componentDidMount: function() {
        ProfileStore.addChangeListener(this._onChange);
        this.loadFollowersFromServer();
    },

    componentWillUnmount: function(){
        ProfileStore.removeChangeListener(this._onChange);
    },
    render: function(){
        var followers = this.state.data.map(function(user,index){
            return (
                <a href={"/" + user.username}>
                    <div>
                    <img src={typeof user.ouuid!=='undefined' ? "http://mojorankdev.s3.amazonaws.com/"+user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg"} className="profile-photo-med round-50"/>
                        <span className="profile-name-row">{ user.name }</span>
                    </div>
                </a>
            )
        });

        return (
            <div>
                {followers}
            </div>
        );
    },
    _onChange:function(){
        this.setState(getFollower());
    }
});

function getFollowing(){
    return {data:ProfileStore.getProfileFollowing()};
}

var Following = React.createClass({
    mixins: [ Router.State ],

    handleData: function(err,data){
        if(err==null){
            WondrousActions.loadProfileFollowing(data);
        }else{
            console.error("error",err);
        }
    },
    loadFollowingFromServer: function(){
        var username = this.getParams().username;
        WondrousAPI.getFollowing({
            page:0,
            username:username,
            callback:this.handleData
        });
    },
    getInitialState: function() {
        return getFollowing();
    },
    componentDidMount: function() {
        ProfileStore.addChangeListener(this._onChange);
        this.loadFollowingFromServer();
    },

    componentWillUnmount: function(){
        ProfileStore.removeChangeListener(this._onChange);
    },
    render: function(){
        var following = this.state.data.map(function(user,index){
            return (
                <a key={user.id} href={"/" + user.username}>
                    <div>
                        <img src={typeof user.ouuid!=='undefined' ? "http://mojorankdev.s3.amazonaws.com/"+user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg"} className="profile-photo-med round-50"/>
                        <span className="profile-name-row">{ user.name }</span>
                    </div>
                </a>
            )
        });

        return (
            <div>
                {following}
            </div>
        );
    },
    _onChange:function(){
        this.setState(getFollowing());
    }
});

function getProfileState(){
    return {data:ProfileStore.getProfileData()};
}

var UserBar = React.createClass({
    getInitialState: function() {
        return getProfileState();
    },
    componentDidMount: function() {
        ProfileStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function(){
        ProfileStore.removeChangeListener(this._onChange);
    },
    getInitialState: function() {
        return getProfileState();
    },

    render: function(){
        return (
            <div className="profile-header">
                <img src="/static/pictures/defaults/p.default-profile-picture.jpg" className="profile-photo round-50"/>

                <span className="profile-header-content">
                    <span className="profile-name">{this.state.data.name}</span>
                    <span className="profile-wscore">
                        <span className="profile-wscore-text round-5">1</span>
                    </span>

                </span>

                <span className="profile-header-nav">
                    <a className="profile-header-nav-link " ref="wall" href={"/"+this.state.data.username}>Posts</a>
                    <a className="profile-header-nav-link " ref="followers" href={"/" + this.state.data.username + "/followers"}>Followers</a>
                    <a className="profile-header-nav-link " ref="following" href={"/" + this.state.data.username + "/following"}>Following</a>
                    <a className="profile-header-nav-link " ref="likes" href={"/" + this.state.data.username + "/likes"}>l!kes</a>
                </span>
            </div>
        );
    },
    _onChange:function(){
        var state = getProfileState();
        if (JSON.stringify(this.state.data) !== JSON.stringify(state.data)) this.setState(state);
    }
});

var Profile = React.createClass({
    mixins: [ Router.State ],

    handleProfileData:function(err, data){
        if(err==null){
            WondrousActions.loadProfileInfo(data);
        }else{
            // WondrousActions.unloadUserInfo(err);
        }
    },
    handleWallData:function(err, data){
        if(err==null){
            WondrousActions.loadWallPosts(data);
        }else{

        }
    },
    loadProfileFromServer: function(){
        WondrousAPI.getUserInfo({
            username: this.getParams().username,
            callback: this.handleProfileData
        });
    },
    loadWallFromServer: function(){
        WondrousAPI.getWallPosts({
            username: this.getParams().username,
            page:0,
            callback: this.handleWallData
        });
    },
    componentDidMount:function(){
        this.loadProfileFromServer();
        this.loadWallFromServer();
    },
    render: function () {
        var username = this.getParams().username;
        return (
            <div className="main-content">
                <UserBar/>
                <div className="cover profile-content">
                    <RouteHandler />
                </div>
            </div>);
    }
});

var ProfileRoute = (
    <Route name="user" path="/:username" handler={Profile}>
        <Route name="follower" path="/:username/followers" handler={Follower}/>
        <Route name="following" path="/:username/following" handler={Following}/>
        <Route name="likes" path="/:username/likes" />
        <DefaultRoute handler={Wall}/>
    </Route>
);
module.exports = ProfileRoute;
