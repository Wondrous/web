var WondrousActions = require('../../actions/WondrousActions');
var ProfileStore = require('../../stores/ProfileStore');
var UserIcon = require('./UserIcon.react');

var Following = React.createClass({
    mixins: [ Router.Navigation, Reflux.listenTo(ProfileStore,"onProfileChange") ],
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
        var is_visible = this.am_following || this.is_private;

        var following = this.state.data.map(function(user, index){
            return (
                <UserIcon key={user.id} user={user} />
            );
        })
        return (
            <ul className="item-ul">
                {following}
            </ul>
        );
    },
    _onChange:function() {
        this.setState(getFollowing());
    }
});

module.exports = Following;
