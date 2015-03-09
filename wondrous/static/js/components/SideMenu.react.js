var UserStore = require('../stores/UserStore');
var NotificationStore = require('../stores/NotificationStore');
var WondrousConstants = require('../constants/WondrousConstants');
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var Link = Router.Link;

var SettingsBar = React.createClass({
    mixins: [Router.Navigation],
    onLogout: function(){
        WondrousActions.logout();
        this.transitionTo('/');
    },
    render: function(){
        return (
            <div>
                <Link to="/info/about/" className="dropdown-a">
                    <div className="dropdown-element">About us</div>
                </Link>

                <Link to="/info/tos/" className="dropdown-a">
                    <div className="dropdown-element">Terms of Service</div>
                </Link>

                <Link to="/info/privacy/" className="dropdown-a">
                    <div className="dropdown-element">Privacy</div>
                </Link>

                <Link to="/settings" className="dropdown-a">
                    <div className="dropdown-element">Account settings</div>
                </Link>

                <Link to="/info/feedback/" className="dropdown-a">
                    <div className="dropdown-element">Feedback</div>
                </Link>

                <hr className="dropdown-hr" />
                <a onClick={this.onLogout} className="dropdown-element" style={{"textDecoration": "none", "display": "block"}}>Log out</a>
            </div>
        );
    }
});

NotificationReasons = {
    COMMENTED: 0,
    UPDATED: 1,
    LIKED: 2,
    FOLLOWED: 3,
    FOLLOW_REQUEST: 4,
    FOLLOW_ACCEPTED: 5,
    REPOSTED:6
};

var Notification = React.createClass({
    mixins: [ Router.Navigation ],

    handleAcceptData:function(err,res){
        if(err==null){
            console.log("accepted! ",res);
        }else{

        }
    },
    handleAccept:function(){
        WondrousAPI.acceptRequest({
            user_id: this.props.data.from_user_id,
            callback: this.handleAcceptData
        });
    },
    handleClick: function(){
        note = this.props.data;
        var url = "/"+note.from_user_username;
        this.transitionTo(url);
    },
    generateContent: function(reason){
        var content = '';
        if (reason == NotificationReasons.FOLLOW_REQUEST) {
            content = "requested to follow you";
        } else if (reason == NotificationReasons.FOLLOWED) {
            content = "followed you";
        } else if (reason == NotificationReasons.FOLLOW_ACCEPTED) {
            content = "accepted your follow request";
        } else if (reason == NotificationReasons.LIKED) {
            content = "liked your post";
        } else if (reason == NotificationReasons.REPOSTED) {
            content = "reposted one of your posts";
        }else if (reason == NotificationReasons.COMMENTED) {
            content = "commented on one of your posts";
        }
        return content;
    },

    render: function() {
        note = this.props.data;

        var actionNeeded = false;
        var content = this.generateContent(note.reason);
        if(note.reason == NotificationReasons.FOLLOW_REQUEST) actionNeeded = true;

        var displayType = note.is_hidden ? "none" : "block";
        var unread = note.is_read ? "" : "notification-unread";
        var url = "/" + note.from_user_username;

        // TODO: Get sender's profile pic
        var profilePic = note.from_user_ouuid ? "http://mojorankdev.s3.amazonaws.com/"+note.from_user_ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
        // var profilePic = "/static/pictures/defaults/p.default-profile-picture.jpg";

        var notificationTitle = "@" + note.from_user_username;

        return (
            <div onClick={this.handleClick} className="dropdown-a">
                <div className="dropdown-element dropdown-element-notification" style={{ "display": displayType, padding: "10px 0" }}>
                    <span className="notificationTextPosition">
                        <img ref="usericon" className="post-thumb round-50" style={{ position: "absolute" }} src={profilePic} />
                        <div className="notification-content">
                            <div>
                                <b title={notificationTitle}>
                                    {note.from_user_name}
                                </b>
                            </div>
                            {content}
                            {actionNeeded ? 
                                <div>
                                    <button className="followerAcceptButton round-2" onClick={this.handleAccept}>Accept +1</button>
                                </div> : ''}

                        </div>
                    </span>
                </div>
            </div>
        );
    }
})

var NotificationsBar = React.createClass({
    mixins: [Reflux.listenTo(NotificationStore,"onNotificationChange")],
    getInitialState: function() {
        return {data:NotificationStore.getNotifications()};
    },
    onNotificationChange: function(){
        this.setState({data:NotificationStore.getNotifications()});
    },
    render:function(){
        console.log("note bar",this.state);

        var notifications = this.state.data.map(function(notification,index){
            return(
                <Notification key={notification.id} data={notification}/>
            )
        });

        return (
            <div style={{ marginBottom: 60 }}>
                {notifications}
            </div>
        );
    },
});

var SideMenu = React.createClass({
    mixins: [Reflux.listenTo(UserStore, "onChange")],
    getInitialState: function() {
        return {data:UserStore.sidebarOpen};
    },

    render: function(){
        var displayStyle = {
            display: UserStore.sidebarOpen ? "block" : "none"
        };

        return(
            <div className="sidemenu" style={displayStyle}>
                <div className="sidemenuOptions _open_bmo">
                    {UserStore.sidebarType==WondrousConstants.SHOW_SETTINGS ? <SettingsBar/>: ''}
                    {UserStore.sidebarType==WondrousConstants.SHOW_NOTIFICATIONS ? <NotificationsBar/>: ''}
                </div>
            </div>
        );
    },

    onChange: function(){
        this.forceUpdate();
    }
})

module.exports = SideMenu;
