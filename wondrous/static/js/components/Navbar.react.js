var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');

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
    render: function () {
        return (
            <span id="right-menu" className="notification-count nc-general round-2">
                <span className="notification-count-text">0</span>
            </span>);
    }
});

var SettingsGear = React.createClass({
    toggleSideBar:function(e){
        WondrousActions.toggleSideBar();
    },
    render: function () {
        return (
            <span className="banner-more-options">
            <span onClick={this.toggleSideBar} className="banner-options-icon">C</span>
            </span>);
    }
});

var ProfileLink = React.createClass({
    render: function () {
        return (
            <a id="linkToProfile" href={"/user/" + this.props.user.username}
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
                <a href="/" style={{"color": "rgb(235, 235, 235)"}}>
                    <img src="/static/pictures/p.icon_50x50.png" className="banner-logo" />
                </a>
                { this.state.loggedin ? <SearchBox />:null}
                { this.state.loggedin ? <SettingsGear />:null}
                { this.state.loggedin ? <ProfileLink user={this.state} />:null}
                { this.state.loggedin ? <NotificationBox /> :null}
            </div>
            );
    },

    // Method to setState based upon Store changes
    _onChange: function(){
        this.setState(getUserState());
    }
});

module.exports = Navbar;
