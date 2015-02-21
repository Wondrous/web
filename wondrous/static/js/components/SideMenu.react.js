var UserStore = require('../stores/UserStore');
var NotificationStore = require('../stores/NotificationStore');
var WondrousConstants = require('../constants/WondrousConstants');
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var Link = Router.Link;

var SettingsBar = React.createClass({
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
                <a href="/auth/logout/" className="dropdown-element" style={{"textDecoration": "none", "display": "block"}}>Log out</a>
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
    FOLLOW_ACCEPTED: 5
};

var Notification = React.createClass({
    mixins: [ Router.Navigation ],

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
            username: this.props.data.from_user_username,
            callback: this.handleProfileData
        });
    },
    loadWallFromServer: function(){
        WondrousAPI.getWallPosts({
            username: this.props.data.from_user_username,
            page:0,
            callback: this.handleWallData
        });
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
            callback:this.handleAcceptData
        });
    },
    handleClick: function(){
        note = this.props.data;
        var url = "/"+note.from_user_username;
        this.loadProfileFromServer();
        this.loadWallFromServer();
        this.transitionTo(url);
    },
    generateContent: function(reason){
        var content = '';
        if (reason==NotificationReasons.FOLLOW_REQUEST){
            content = note.from_user_firstname + " requested to follow you";
        } else if (reason==NotificationReasons.FOLLOWED){
            content = note.from_user_firstname + " followed you";
        } else if (reason==NotificationReasons.FOLLOW_ACCEPTED){
            content = note.from_user_firstname + " accepted your follow request";
        }
        return content;
    },

    render: function(){
        note = this.props.data;
        var actionNeeded = false;
        var content = this.generateContent(note.reason);
        if(note.reason == NotificationReasons.FOLLOW_REQUEST) actionNeeded = true;

        var displayType = note.is_hidden?"none":"block";
        var unread = note.is_read?"":"notification-unread";
        var url = "/"+note.from_user_username;
        return (
            <div onClick={this.handleClick} className="dropdown-a">
                <div className={"dropdown-element"} style={{'display':displayType}}>
                    <img/>
                    <span>{content}</span>
                    {actionNeeded ? <button onClick={this.handleAccept}>"Accept"</button> : ''}
                </div>
            </div>
        );
    }
})

var NotificationsBar = React.createClass({
    handleData:function(err,data){
        if(!err){
            WondrousActions.loadUserNotification(data);
        }else{
            console.error("err",err);
        }
    },
    loadFromServer: function(){
        WondrousAPI.getNotifications({
            page: 0,
            callback:this.handleData
        });
    },
    getInitialState: function() {
        return {data:NotificationStore.getNotifications()};
    },

    componentDidMount: function() {
        NotificationStore.addChangeListener(this._onChange);
        this.loadFromServer();
    },

    componentWillUnmount: function(){
        NotificationStore.removeChangeListener(this._onChange);
    },
    render:function(){
        var notifications = this.state.data.map(function(notification,index){
            return(
                <Notification key={notification.id} data={notification}/>
            )
        });

        return (
            <div>
                {notifications}
            </div>
        );
    },
    _onChange: function(){
        this.setState({data:NotificationStore.getNotifications()});
    }
});

var SideMenu = React.createClass({
    getInitialState: function() {
        return {data:UserStore.isShowingSideBar()};
    },
    componentDidMount: function() {
        UserStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function(){
        UserStore.removeChangeListener(this._onChange);
    },
    render: function(){
        var displayStyle = {
            display: this.state.data.isShowing ? "block" : "none"
        };

        return(
            <div className="sidemenu" style={displayStyle}>
                <div className="sidemenuOptions _open_bmo">
                    {this.state.data.barOnDisplay==WondrousConstants.SHOW_SETTINGS ? <SettingsBar/>: ''}
                    {this.state.data.barOnDisplay==WondrousConstants.SHOW_NOTIFICATIONS ? <NotificationsBar/>: ''}
                </div>
            </div>
        );
    },

    _onChange: function(){
        this.setState({
            data:{
                isShowing: UserStore.isShowingSideBar(),
                barOnDisplay: UserStore.barOnDisplay()
                }
            });
    }
})

module.exports = SideMenu;
