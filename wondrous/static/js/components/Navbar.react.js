var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var Link = Router.Link;

var SearchBox = React.createClass({
    render: function() {
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

    toggleNotifications: function(e) {
        WondrousActions.toggleNotifications();
    },
    render: function () {
        var notes = UserStore.user.unseen_notifications || 0;
        var cn = (notes > 0) ? "notification-count nc-general round-2 notification-alert":"notification-count nc-general round-2";
        return (
            <span onClick={this.toggleNotifications} id="right-menu" className={cn}>
                <span className="notification-count-text">{notes}</span>
            </span>);
    }
});

var SettingsGear = React.createClass({
    toggleSettings: function(e) {
        WondrousActions.toggleSettings();
    },
    render: function() {
        return (
            <span onClick={this.toggleSettings} className="banner-more-options">
                <span className="banner-options-icon">C</span>
            </span>);
    }
});

var ProfileLink = React.createClass({
    mixins: [ Router.Navigation ],
    handleClick:function(evt) {
        evt.preventDefault();
        if (typeof this.props.user.username != 'undefined') {
            this.transitionTo('/' + this.props.user.username);
        }
    },
    render: function () {
        var img_src = (typeof this.props.user.ouuid !== 'undefined')? "http://mojorankdev.s3.amazonaws.com/"+this.props.user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = "/" + this.props.user.username;
        return (
            <a id="linkToProfile" href={hrefPlaceholder} onClick={this.handleClick} className="general-text banner-user-name">
                <img className="banner-user-img round-3"
                    src={img_src}/>
                {this.props.user.name}
            </a>);
    }
});

// Method to retrieve state from stores
function getUserState() {
    var data = UserStore.user;
    data.loggedin = UserStore.loggedIn;
    return data;
}

var Navbar = React.createClass({
    mixins: [
        Router.Navigation,
        Reflux.listenTo(UserStore,'onUserUpdate'),
    ],
    getInitialState: function() {
        return getUserState();
    },

    render: function () {
        return (
            <div id="topBanner" className={UserStore.loggedIn ? "top-banner" : "top-banner banner-lo"}>
                <Link to="/" style={{"color": "rgb(235, 235, 235)"}}>
                    <img src="/static/pictures/p.icon_50x50.png" className="banner-logo" />
                </Link>
                { UserStore.loggedIn ? <SearchBox /> : null}
                { UserStore.loggedIn ? <SettingsGear user={this.state}/> : null}
                { UserStore.loggedIn ? <ProfileLink user={this.state} /> : null}
                { UserStore.loggedIn ? <NotificationBox /> : null}
            </div>
            );
    },

    // Method to setState based upon Store changes
    onUserUpdate: function(userData) {
        this.setState(getUserState());
    }
});

module.exports = Navbar;
