var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var ModalStore = require('../stores/ModalStore');
var NotificationStore = require('../stores/NotificationStore');
var checkLogin = require('../utils/Func').checkLogin;
var URLGenerator = require('../utils/URLGenerator');

var SearchBox = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    handleSearch: function(evt) {
        evt.preventDefault();
        var search = this.refs.query.getDOMNode().value.trim();

        if (search.indexOf("#") > -1) {
            // going to be a tag search
            search = search.replace('#', '');
            this.context.router.transitionTo("tags",{search: search});
            WondrousActions.newSearch(search, true);
        }else{
            this.context.router.transitionTo("search",{search: search});
            WondrousActions.newSearch(search, false);
        }

    },

    render: function() {
        return (
        <form method="GET" onSubmit={this.handleSearch} style={{ display: "inline-block" }}>
            <div className="container">
                <input type="text" ref="query" id="query" className="navbar-search-input"
                    placeholder="Search for people and #tags" name="q"
                    data-provide="typeahead" autoComplete="off" />
            </div>
        </form>);
    }
});

var NotificationBox = React.createClass({
    first: true,
    unseen: 0,
    mixins: [Reflux.listenTo(NotificationStore, 'onNotificationUpdate')],

    onNotificationUpdate: function(){
        if (this.unseen!=NotificationStore.unseen){
            var con = $(this.refs.noteCount.getDOMNode());
            con.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                $(this).removeClass('animated flash');
            });
            con.addClass('animated flash');
            this.unseen = NotificationStore.unseen || 0;
            if (this.unseen == 0) {
                document.title = "Wondrous";
            } else {
                document.title = "Wondrous ("+String(this.unseen)+")";
            }
            this.forceUpdate();
        }
    },

    toggleNotifications: function(e) {
        WondrousActions.toggleNotifications();
    },

    render: function () {
        var notes = this.unseen;
        var cn = "navbar-btn notification-count round-2";
        cn += (notes > 0) ? " notification-alert" : "";
        return (
            <span onClick={this.toggleNotifications} ref="noteCount" className={cn}>
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
            <span onClick={this.toggleSettings} className="navbar-btn navbar-heydings-icon round-2">
                <span className="navbar-btn-icon">C</span>
            </span>);
    }
});

var ProfileLink = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    handleClick: function(evt) {
        evt.preventDefault();
        if (typeof this.props.user.username !== 'undefined') {
            this.context.router.transitionTo('/' + this.props.user.username);
        }
    },

    render: function () {
        var img_src = (typeof UserStore.user.ouuid !== 'undefined') ? URLGenerator.generate45(UserStore.user.ouuid) : "/static/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = "/" + UserStore.user.username;
        return (
            <Link id="linkToProfile" to={hrefPlaceholder} className="navbar-btn round-2">
                <span className="navbar-user">
                    <img className="navbar-avatar round-50" src={img_src}/>
                </span>
                <span className="navbar-btn-text">{UserStore.user.name}</span>
            </Link>);
    }
});

var NewPostIcon = React.createClass({

    newPost: function() {
        WondrousActions.togglePostModal();
    },

    render: function() {
        return (
            <span onClick={this.newPost} className="navbar-btn navbar-newpost-wrapper round-2" style={{ paddingLeft: 25 }}>
                <img className="post-general-icon navbar-newpost-icon" src="/static/pictures/icons/newpost/newpost_white.svg" />
                <span className="navbar-btn-text">New Post</span>
            </span>
        );
    }
});

var Navbar = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    mixins: [
        Reflux.listenTo(UserStore,'onUserUpdate')
    ],

    render: function() {
        if(!UserStore.loaded){
            return (<div></div>);
        }
        // TODO this a tag is out of bounds
        return (
            <div id="topBanner" className={UserStore.loggedIn ? "navbar" : "navbar navbar-lo"}>

                <Link to="/" onClick={ModalStore.clearModal} style={{ color: "rgb(234,234,234)" }}>
                    <img src="/static/pictures/p.icon_50x50.png" className="navbar-logo" />
                </Link>
                {UserStore.loggedIn ?
                    <span>
                        <SearchBox />
                        <div className="navbar-right">
                            {/*<NewPostIcon />*/}
                            <ProfileLink />
                            <NotificationBox />
                            <SettingsGear/>
                        </div>
                    </span>
                    : null}

                {!UserStore.loggedIn ?
                    <div className="navbar-right">
                        <span onClick={checkLogin} className="navbar-btn navbar-login-btn round-15">Login</span>
                    </div>
                    : null}
            </div>
        );
    },

    // Method to setState based upon Store changes
    onUserUpdate: function() {
        this.forceUpdate();
    }

});

module.exports = Navbar;
