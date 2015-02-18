var Post = require('./Post.react');
var WallStore = require('../stores/WallStore');
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
        return (
            <div>
                <PostForm />
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

function getProfileState(){
    return {data:ProfileStore.getProfileData()};
}

var UserBar = React.createClass({


    getInitialState: function() {
        return getProfileState();
    },
    componentDidMount: function() {
        WallStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function(){
        WallStore.removeChangeListener(this._onChange);
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
                    <a className="profile-header-nav-link current-tab" href="/user1/">Posts</a>
                    <a className="profile-header-nav-link " href="/user1/followers/">Followers</a>
                    <a className="profile-header-nav-link " href="/user1/following/">Following</a>
                    <a className="profile-header-nav-link " href="/user1/likes/">l!kes</a>
                </span>
            </div>
        );
    },
    _onChange:function(){
        this.setState(getProfileState());
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
    componentWillMount:function(){
        this.loadProfileFromServer();
        this.loadWallFromServer();
    },
    render: function () {
        var username = this.getParams().username;
        return (
            <div className="main-content">
                <UserBar username={username}/>
                <div className="cover profile-content">
                    <RouteHandler />
                </div>
            </div>);
    }
});

var ProfileRoute = (
    <Route name="user" path="/:username" handler={Profile}>
      <DefaultRoute handler={Wall}/>
    </Route>
);
module.exports = ProfileRoute;
