var WondrousActions = require('../../actions/WondrousActions');
var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');


var InfluenceStats = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [ Reflux.listenTo(ProfileStore,"onProfileChange") ],
    onProfileChange: function(profileData){
        console.log("profile changed",profileData);
    },
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    getInitialState: function() {
        return {data:ProfileStore.user};
    },

    render: function() {
        console.log("this state",this.state.data);

        return (
            <div>
                VIEW COUNT IS: {this.state.data.view_count}
                LIKE COUNT IS: {this.state.data.like_count}
            </div>
        );
    }
});

module.exports = InfluenceStats;
