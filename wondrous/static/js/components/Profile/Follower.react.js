var WondrousActions = require('../../actions/WondrousActions');
var ProfileStore = require('../../stores/ProfileStore');
var UserIcon = require('./UserIcon.react');

var Follower = React.createClass({
    mixins: [
        Router.Navigation,
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
        return this.transitionTo('/' + username)
    },
    render: function(){
        this.am_following = ProfileStore.user.following;
        this.is_private = ProfileStore.user.is_private;
        var is_visible = this.am_following || this.is_private;
        var handle = this.handleClick;
        var followers = this.state.data.map(function(user, index){
            return (
                <UserIcon key={user.id} user={user}/>
            );
        });

        return (
            <ul className="item-ul">
                {followers}
            </ul>
        );
    },
    _onChange: function() {
        this.setState(getFollower());
    }
});

module.exports = Follower;
