var Post = require('./Post.react');
var WallStore = require('../stores/WallStore');
var UserStore = require('../stores/UserStore');
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var ProfileStore = require('../stores/ProfileStore');
var RouteHandler = require('react-router').RouteHandler;
var DefaultRoute = require('react-router').DefaultRoute;
var Route = require('react-router').Route;
var Link = Router.Link;
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
        var am_following = getProfileState().data.following;
        var is_private = getProfileState().data.is_private;
        var is_visible = am_following||is_private;
        is_visible = is_visible==true;
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

var UserIcon = React.createClass({
    mixins: [ Router.Navigation ],
    handleProfileData:function(err, data){
        if(err==null){
            console.log("profile",data);
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
            username: this.props.user.username,
            callback: this.handleProfileData
        });
    },
    loadWallFromServer: function(){
        WondrousAPI.getWallPosts({
            username: this.props.user.username,
            page:0,
            callback: this.handleWallData
        });
    },
    handleClick: function(){
        this.transitionTo('/'+this.props.user.username);
        this.loadProfileFromServer();
        this.loadWallFromServer();
    },
    render: function(){
        return (
            <a onClick={this.handleClick}>
                <div>
                <img src={typeof this.props.user.ouuid!=='undefined' ? "http://mojorankdev.s3.amazonaws.com/"+this.props.user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg"} className="profile-photo-med round-50"/>
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
    handleClick: function(username){
        return this.transitionTo('/'+username)
    },
    render: function(){
        this.am_following = getProfileState().data.following;
        this.is_private = getProfileState().data.is_private;
        var is_visible = this.am_following||this.is_private;
        var handle = this.handleClick;
        var followers = this.state.data.map(function(user,index){
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
    _onChange:function(){
        this.setState(getFollower());
    }
});

function getFollowing(){
    return {data:ProfileStore.getProfileFollowing()};
}

var Following = React.createClass({
    mixins: [ Router.State, Router.Navigation ],
    am_following:getProfileState().data.following,
    is_private:getProfileState().data.is_private,

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
        this.am_following = getProfileState().data.following;
        this.is_private = getProfileState().data.is_private;
        var is_visible = this.am_following||this.is_private;

        var following = this.state.data.map(function(user,index){
            return (
                <UserIcon user={user}/>
            );
        })
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
    mixins: [ Router.Navigation ],

    am_following:getProfileState().data.following,
    is_private:getProfileState().data.is_private,

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
    handleData: function(err,data){
        if(err==null){
            var currentState = this.state.data;
            currentState.following = data.following == true;

            this.setState({data:currentState});
        }else{
            console.error("error",err);
        }
    },
    handleFollow: function(){
        user_id = getProfileState().data.id;
        if(!user_id && typeof user_id === 'undefined') return;

        WondrousAPI.toggleFollow({
            user_id:user_id,
            callback:this.handleData
        })
    },
    render: function(){
        var username = this.props.username;
        var is_me = username === UserStore.getUserData().username;

        this.is_private = getProfileState().data.is_private;
        this.am_following = getProfileState().data.following==true;

        return (
            <div className="profile-header">
                <img src="/static/pictures/defaults/p.default-profile-picture.jpg" className="profile-photo round-50"/>

                <span className="profile-header-content">
                    <span className="profile-name">{this.state.data.name}</span>
                    <span className="profile-wscore">
                        <span className="profile-wscore-text round-5">1</span>
                    </span>
                    {!is_me ? <button onClick={this.handleFollow}> {this.am_following? 'UNFOLLOW':'FOLLOW'}</button> : null}
                </span>

                <span className="profile-header-nav">
                    <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link" to="user" params={{username: username}}>Wall</Link>
                    <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link " to="follower" params={{username: username}}>Follower</Link>
                    <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link " to="following" params={{username: username}}>Following</Link>
                    <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link " to="likes" params={{username: username}}>Likes</Link>
                </span>
            </div>
        );
    },
    _onChange:function(){
        var state = getProfileState();
        this.setState(state);
    }
});

var PrivateProfile = React.createClass({
    handleData: function(err,data){
        if(err==null){
            $(this.refs.requestBtn.getDOMNode()).html('request sent!');
            $(this.refs.requestBtn.getDOMNode()).prop("disabled",true);
        }else{
            console.error("error",err);
        }
    },
    handleClick :function(){
        user_id = this.props.user.id;
        console.log("sending",this.props.user);

        if(!user_id && typeof user_id === 'undefined') return;
        WondrousAPI.toggleFollow({
            user_id:user_id,
            callback:this.handleData
        })
    },
    render:function(){
        return (
            <div>
                <h1 className="profile-landing-name">{ this.props.user.name }</h1>
                <img className="profile-landing-profile-picture round-50" src={typeof this.props.user.ouuid!=='undefined' ? "http://mojorankdev.s3.amazonaws.com/"+this.props.user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg"}/>

                <div>
                    <button onClick={this.handleClick} ref="requestBtn" className="btn follow-btn round-3 animate-e-i-o">Request to Follow</button>
                </div>
            </div>
        );
    }
});

var Profile = React.createClass({
    mixins: [Router.Navigation, Router.State],
    getInitialState:function(){
        return getProfileState();
    },
    handleProfileData:function(err, data){
        if(err==null){
            console.log("profile",data);
            WondrousActions.loadProfileInfo(data);
        }else{
            this.replaceWith('/')
            console.error("error",err);
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
    componentDidMount: function() {
        ProfileStore.addChangeListener(this._onChange);
        this.loadProfileFromServer();
        this.loadWallFromServer();
    },

    componentWillUnmount: function(){
        ProfileStore.removeChangeListener(this._onChange);
    },
    render: function () {
        var username = this.getParams().username;

        var am_following = getProfileState().data.following;
        var is_private = getProfileState().data.is_private;
        var is_visible = (typeof am_following !=='undefined' && am_following==true)||(typeof is_private !=='undefined' && !is_private==true);

        return (
            <div className="main-content">
                {!is_visible?<PrivateProfile user={getProfileState().data}/> :
                    <div>
                        <UserBar username={username}/>
                        <div className="cover profile-content">
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
        <Route name="follower" path="/:username/followers" handler={Follower}/>
        <Route name="following" path="/:username/following" handler={Following}/>
        <Route name="likes" path="/:username/likes" />
        <DefaultRoute handler={Wall}/>
    </Route>
);
module.exports = ProfileRoute;
