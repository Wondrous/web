var WondrousActions = require('../../actions/WondrousActions');
var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');
var UserIcon = require('./UserIcon.react');
var UserBox = require('../Box/UserBox.react');

var Following = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [ Reflux.listenTo(ProfileStore,"onProfileChange") ],
    onProfileChange: function(profileData){
        if (profileData.hasOwnProperty('following')){
            this.setState({data:profileData.following});
        }else{
            WondrousActions.loadFollowing(ProfileStore.user.username,ProfileStore.followingPage);
        }
    },
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    getInitialState: function() {
        WondrousActions.loadFollowing(ProfileStore.user.username,ProfileStore.followingPage);
        return {data:ProfileStore.following.sortedSet};
    },

    render: function() {
        this.am_following = ProfileStore.user.following;
        this.is_private = ProfileStore.user.is_private;
        var username = this.context.router.getCurrentParams().username;
        var is_me = username === UserStore.user.username;
        var is_visible = this.am_following || this.is_private;

        var following = this.state.data.map(function(user, index) {
            return (
                <UserIcon key={user.id} user={user} />
            );
        });
        
        return (
            <ul className="item-ul">
                {following}
                {following.length == 0 ?
                    <span>
                        {is_me ?
                            <UserBox />
                            : null}
                        <div className="no-data-to-display">
                            {is_me ?
                                "You're not following anyone yet"
                                :
                                "This user isn't following anyone yet"
                            }
                        </div>
                    </span>
                    : null}
            </ul>
        );
    },
    _onChange:function() {
        this.setState(getFollowing());
    }
});

module.exports = Following;
