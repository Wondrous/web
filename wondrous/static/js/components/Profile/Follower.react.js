var WondrousActions = require('../../actions/WondrousActions');
var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');
var UserIcon = require('./UserIcon.react');

var Follower = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [
        Reflux.listenTo(ProfileStore,"onProfileChange")
    ],
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    onProfileChange: function(profileData){
        if (profileData.hasOwnProperty('followers')){
            this.setState({data:profileData.followers});
        }else{
            WondrousActions.loadFollower(ProfileStore.user.username,ProfileStore.followerPage);
        }
    },

    getInitialState: function() {
        WondrousActions.loadFollower(ProfileStore.user.username, ProfileStore.followerPage);
        return {data:ProfileStore.followers.sortedSet};
    },

    handleClick: function(username) {
        return this.context.router.transitionTo('/' + username)
    },
    render: function(){
        this.am_following = ProfileStore.user.following;
        this.is_private = ProfileStore.user.is_private;
        var username = this.context.router.getCurrentParams().username;
        var is_me = username === UserStore.user.username;
        var is_visible = this.am_following || this.is_private;
        var handle = this.handleClick;
        var followers = this.state.data.map(function(user, index){
            return (
                <UserIcon key={user.id} user={user}/>
            );
        });

        var noData = followers.length == 0;

        return (
            <ul className="item-ul">
                {followers}
                {noData ?
                    <div className="no-data-to-display">
                        {is_me ?
                            "You don't have any followers yet"
                            :
                            "This user doesn't have any followers yet"
                        }
                    </div>
                    : null}
            </ul>
        );
    },
    _onChange: function() {
        this.setState(getFollower());
    }
});

module.exports = Follower;
