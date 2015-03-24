var SettingStore = require('../stores/SettingStore');
var UserStore = require('../stores/UserStore');
var NotificationStore = require('../stores/NotificationStore');
var WondrousConstants = require('../constants/WondrousConstants');
var NotificationConstants = require('../constants/NotificationConstants');
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');

var SettingsBar = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    onLogout: function(){
        WondrousActions.logout();
        this.context.router.transitionTo('/');
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


var Notification = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
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
        var reason = note.reason;
        if (reason == NotificationConstants.LIKED || reason == NotificationConstants.REPOSTED || reason == NotificationConstants.COMMENTED || reason == NotificationConstants.MENTIONED) {
            WondrousActions.newPostLoad(note.subject_id);
        } else {
            var url = "/"+note.from_user_username;
            this.context.router.transitionTo(url);
        }
    },
    generateContent: function(reason){
        var content = '';
        if (reason == NotificationConstants.FOLLOW_REQUEST) {
            content = "requested to follow you";
        } else if (reason == NotificationConstants.FOLLOWED) {
            content = "followed you";
        } else if (reason == NotificationConstants.FOLLOW_ACCEPTED) {
            content = "accepted your follow request";
        } else if (reason == NotificationConstants.LIKED) {
            content = "liked your post";
        } else if (reason == NotificationConstants.REPOSTED) {
            content = "reposted one of your posts";
        }else if (reason == NotificationConstants.COMMENTED) {
            content = "commented on one of your posts";
        }else if (reason == NotificationConstants.MENTIONED) {
            content = "mentioned you in a post";
        }
        return content;
    },

    render: function() {
        note = this.props.data;

        var actionNeeded = false;
        var content = this.generateContent(note.reason);
        if(note.reason == NotificationConstants.FOLLOW_REQUEST) actionNeeded = true;

        var displayType = note.is_hidden ? "none" : "block";
        var unread = note.is_read ? "" : "notification-unread";
        var url = "/" + note.from_user_username;

        // TODO: Get sender's profile pic
        var profilePic = note.from_user_ouuid ? "http://mojorankdev.s3.amazonaws.com/"+note.from_user_ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
        // var profilePic = "/static/pictures/defaults/p.default-profile-picture.jpg";

        var notificationTitle = "@" + note.from_user_username;

        return (
            <div onClick={this.handleClick} className="dropdown-a">
                <div className="dropdown-element dropdown-element-notification" style={{ "display": displayType }}>
                    <span className="notificationTextPosition">
                        <img ref="usericon" className="post-thumb round-2" style={{ position: "absolute" }} src={profilePic} />
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
                <h5 className="notification-menu-header">Activity</h5>
                {notifications}
                <div>
                {!NotificationStore.donePaging&&notifications.length>0?<img className="loading-wheel" style={{ height: 25, width: 25 }} src="/static/pictures/p.loading.gif"/>:null}
                </div>
            </div>

        );
    },
});

var SideMenu = React.createClass({
    mixins: [Reflux.listenTo(SettingStore, "onSettingChange")],
    getInitialState: function() {
        return {data:UserStore.sidebarOpen};
    },
    onSideScroll: function(evt){
        if($(this.refs.noteContainer.getDOMNode()).scrollTop() + $(this.refs.noteContainer.getDOMNode()).innerHeight()+25 >= $(this.refs.noteContainer.getDOMNode())[0].scrollHeight) {
            NotificationStore.loadMore();
        }
    },
    componentDidMount: function(){
        $(this.refs.noteContainer.getDOMNode()).scroll(this.onSideScroll);
        if($(this.refs.noteContainer.getDOMNode()).scrollTop() + $(this.refs.noteContainer.getDOMNode()).innerHeight()+25>=$(this.refs.noteContainer.getDOMNode())[0].scrollHeight){
            NotificationStore.loadMore();
        }
    },
    render: function(){
        var displayStyle = {
            display: SettingStore.sidebarOpen ? "block" : "none"
        };

        return(
            <div ref="noteContainer" className="sidemenu" style={displayStyle}>
                <div className="sidemenuOptions _open_bmo">
                    {SettingStore.sidebarType==WondrousConstants.SHOW_SETTINGS ? <SettingsBar/>: ''}
                    {SettingStore.sidebarType==WondrousConstants.SHOW_NOTIFICATIONS ? <NotificationsBar/>: ''}
                </div>
            </div>
        );
    },

    onSettingChange: function(){
        this.forceUpdate();
    }
})

module.exports = SideMenu;
