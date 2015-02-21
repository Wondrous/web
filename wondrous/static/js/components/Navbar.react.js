var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var Link = Router.Link;

var SearchBox = React.createClass({
    render: function () {
        return (
        <form method="GET" action="/search/" style={{"display": "inline-block"}}>
            <div className="container">
              <input type="text" id="query" className="banner-input"
                  placeholder="Search for people and #tags" name="q"
                  data-provide="typeahead" autoComplete="off" />
            </div>
        </form>);
    }
});

var NotificationBox = React.createClass({
    toggleNotifications:function(e){
        WondrousActions.toggleNotifications();
    },
    render: function () {
        var notes = UserStore.getUserData().unseen_notifications||0;

        var cn = (notes > 0) ? "notification-count nc-general round-2 notification-alert":"notification-count nc-general round-2";
        return (
            <span onClick={this.toggleNotifications} id="right-menu" className={cn}>
                <span className="notification-count-text">{notes}</span>
            </span>);
    }
});

var SettingsGear = React.createClass({
    toggleSettings:function(e){
        WondrousActions.toggleSettings();
    },
    render: function () {
        return (
            <span className="banner-more-options">
                <span onClick={this.toggleSettings} className="banner-options-icon">C</span>
            </span>);
    }
});

var ProfileLink = React.createClass({
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
    handleClick:function(){
        if (typeof this.props.user.username != 'undefined'){
            this.transitionTo('/'+this.props.user.username);
            this.loadProfileFromServer();
            this.loadWallFromServer();
        }
    },
    render: function () {
        return (
            <a id="linkToProfile" onClick={this.handleClick}
                className="general-text banner-user-name">
                <img className="banner-user-img round-3"
                    src="/static/pictures/defaults/p.default-profile-picture.jpg" />
                {this.props.user.first_name}
            </a>);
    }
});

// Method to retrieve state from stores
function getUserState(){
    var data = UserStore.getUserData();
    data.loggedin = UserStore.isUserLoggedIn();
    return data;
}

var Navbar = React.createClass({
    handleData:function(err, data){
        if(err==null){
            WondrousActions.loadUserInfo(data);
        }else{
            WondrousActions.unloadUserInfo(err);
        }
    },

    loadUserFromServer: function(){
        WondrousAPI.getMyInfo({
            callback:this.handleData
        });
    },

    getInitialState: function() {
        // Return the default value, but also request new from server
        this.loadUserFromServer();
        return getUserState();
    },

    componentDidMount: function() {
        UserStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function(){
        UserStore.removeChangeListener(this._onChange);
    },
    render: function () {
        return (
            <div id="topBanner" className={this.state.loggedin?"top-banner":"top-banner banner-lo"}>
                <Link to="/" style={{"color": "rgb(235, 235, 235)"}}>
                    <img src="/static/pictures/p.icon_50x50.png" className="banner-logo" />
                </Link>
                { this.state.loggedin ? <SearchBox /> : null}
                { this.state.loggedin ? <SettingsGear /> : null}
                { this.state.loggedin ? <ProfileLink user={this.state} /> : null}
                { this.state.loggedin ? <NotificationBox /> : null}
            </div>
            );
    },

    // Method to setState based upon Store changes
    _onChange: function(){
        this.setState(getUserState());
    }
});

module.exports = Navbar;
