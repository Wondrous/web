var PostForm = require('../Modals/PostForm.react');
var ProfileStore = require('../../stores/ProfileStore');
var WallStore = require('../../stores/WallStore');
var UserStore = require('../../stores/UserStore');
var WondrousActions = require('../../actions/WondrousActions');
var UserBar = require('./UserBar.react');
var PrivateProfile = require('./PrivateProfile.react');

var Profile = React.createClass({
    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(ProfileStore,"onProfileChange")
    ],

    onProfileChange: function(){
        var username = this.getParams().username;
        if (ProfileStore.user.username === username){
            this.forceUpdate();
        }
    },

    render: function () {
        var username = this.getParams().username;

        if(ProfileStore.user.username !== username){
            WondrousActions.newProfile(username);
            WondrousActions.loadProfile(username);
            WallStore.loadMore(username);
            return (
                <div></div>
            );
        }
        var am_following = ProfileStore.user.following;
        var is_private = ProfileStore.user.is_private;
        var is_visible = (typeof am_following !== 'undefined' && am_following == true) || (typeof is_private !== 'undefined' && !is_private == true);
        var loaded = (typeof ProfileStore.user.is_private !== 'undefined');
        var style = {display: 'none'};

        // we don't load until we are loaded :)
        if (loaded) {
            style.display = 'block';
        }
        return (
            <div style={style}>
                {!is_visible ? <PrivateProfile user={ProfileStore.user} /> :
                    <div>
                        <UserBar username={username}/>
                        <div className="cover profile-content">
                            <RouteHandler />
                        </div>
                    </div>
                }
            </div>);
    }
});

module.exports = Profile;
