var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var NotificationStore = require('../stores/NotificationStore');
var checkLogin = require('../utils/Func').checkLogin;

var SearchBox = React.createClass({
    mixins: [Router.Navigation],
    handleSearch: function(evt){
        evt.preventDefault();
        var search = this.refs.query.getDOMNode().value.trim();

        if (search.indexOf("#") > -1){
            // going to be a tag search
            search = search.replace('#','');
            this.transitionTo("tags",{search:search});
            WondrousActions.newSearch(search,true);
        }else{
            this.transitionTo("search",{search:search});
            WondrousActions.newSearch(search,false);
        }

    },
    render: function() {
        return (
        <form method="GET" onSubmit={this.handleSearch} style={{ display: "inline-block" }}>
            <div className="container">
              <input type="text" ref="query" id="query" className="banner-input"
                  placeholder="Search for people and #tags" name="q"
                  data-provide="typeahead" autoComplete="off" />
            </div>
        </form>);
    }
});

var NotificationBox = React.createClass({
    first:true,
    unseen:0,
    mixins: [Reflux.listenTo(NotificationStore, 'onNotificationUpdate')],

    onNotificationUpdate: function(){
        if (this.unseen!=NotificationStore.unseen){
            var con = $(this.refs.noteCount.getDOMNode());
            con.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                $(this).removeClass('animated flash');
            });
            con.addClass('animated flash');
            this.unseen = NotificationStore.unseen || 0;
            if (this.unseen==0){
                document.title = "Wondrous";
            }else{
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
        var cn = (notes > 0) ? "notification-count nc-general round-2 notification-alert":"notification-count nc-general round-2";
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
        var img_src = (typeof UserStore.user.ouuid !== 'undefined')? "http://mojorankdev.s3.amazonaws.com/"+UserStore.user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = "/" + UserStore.user.username;
        return (
            <Link id="linkToProfile" to={hrefPlaceholder}  className="general-text banner-user-name">
                <img className="banner-user-img round-3"
                    src={img_src}/>
                {UserStore.user.name}
            </Link>);
    }
});

var Navbar = React.createClass({
    mixins: [
        Router.Navigation,
        Reflux.listenTo(UserStore,'onUserUpdate')
    ],
    newPost: function(){
        WondrousActions.togglePostModal();
    },
    render: function () {
        return (
            <div id="topBanner" className={UserStore.loggedIn ? "top-banner" : "top-banner banner-lo"}>
                <Link to="/" style={{ color: "rgb(235, 235, 235)" }}>
                    <img src="/static/pictures/p.icon_50x50.png" className="banner-logo" />
                </Link>
                { UserStore.loggedIn ? <SearchBox /> : null}
                { UserStore.loggedIn ? <SettingsGear/> : null}
                { UserStore.loggedIn ? <ProfileLink /> : null}
                { UserStore.loggedIn ? <NotificationBox /> : null}
                { !UserStore.loggedIn ? <span onClick={checkLogin} className="general-text banner-user-name">New Post</span> : <span onClick={this.newPost} className="general-text banner-user-name">New Post</span>}
            </div>
            );
    },

    // Method to setState based upon Store changes
    onUserUpdate: function() {
        this.forceUpdate();
    }

});

module.exports = Navbar;
