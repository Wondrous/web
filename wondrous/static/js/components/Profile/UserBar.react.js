var WondrousActions = require('../../actions/WondrousActions');
var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');
var ProfileBarBadge = require('./ProfileBarBadge.react');
var InfluencerBadge = require('./InfluencerBadge.react');

var UserBar = React.createClass({
    mixins: [
        Router.Navigation,
        Reflux.listenTo(ProfileStore, 'onProfileChange')
    ],

    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    onProfileChange: function(profileData){
        this.setState({
            data: ProfileStore.user
        });
    },

    getInitialState: function() {
        console.log(ProfileStore.user);
        return {data: ProfileStore.user};
    },

    handleData: function(err, data) {
        if (err == null){
            var currentState = this.state.data;
            currentState.following = data.following == true;
            this.setState({data: currentState});
        } else{
            console.error("error", err);
        }
    },
    handleFollow: function() {
        user_id = ProfileStore.user.id;
        if (!user_id && typeof user_id === 'undefined') return;

        WondrousAPI.toggleFollow({
            user_id: user_id,
            callback: this.handleData
        })
    },

    handleClick: function() {
        var is_me = this.props.username === UserStore.user.username;
        if (is_me) {
            WondrousActions.togglePictureModal();
        }
    },

    render: function() {
        this.is_private = ProfileStore.user.is_private;
        this.am_following = this.state.data.following == true;

        var username = this.props.username;
        var is_me = username === UserStore.user.username;
        var ouuid = (typeof ProfileStore.user.ouuid !== 'undefined') ? ProfileStore.user.ouuid : false;
        var img_src = ouuid ? "http://mojorankdev.s3.amazonaws.com/"+ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
        var classes = "profile-header-nav-item follow-button round-50 ";
        var is_influencer = $.inArray(0, this.state.data.badges) != -1;

        // This is temporary...sorta
        var wondrousScore = this.state.data.wondrous_score;
        if (is_influencer && wondrousScore < 75) {
            wondrousScore = 75;
        }

        if (this.am_following) {
            var btnTitle = "following";
            classes += "is-following";
        } else {
            var btnTitle = "follow";
            classes += "not-following";
        }

        return (
            <div className="profile-header">
                <div className="profile-photo-wrapper">
                    <img className="profile-photo round-50" style={is_me ? {cursor: 'pointer'} : {}} onClick={this.handleClick} src={img_src} />
                </div>

                <div className="profile-header-content">

                    {is_influencer ?
                        <InfluencerBadge size="large" />
                        : null}

                    <div className="profile-name">{this.state.data.name}</div>
                    <div className="profile-username">@{this.state.data.username}</div>

                </div>
                <hr className="profile-hr" />
                <ul className="profile-header-nav">
                    <ProfileBarBadge to={"wall"} name={"posts"} number={this.state.data.post_count} username={this.state.data.username} />
                    <ProfileBarBadge to={"followers"} name={"followers"} number={this.state.data.follower_count-1} username={this.state.data.username} />
                    <ProfileBarBadge to={"following"} name={"following"} number={this.state.data.following_count-1} username={this.state.data.username} />
                    <ProfileBarBadge to={"wall"} name={"influence"} number={wondrousScore} username={this.state.data.username} />

                    {!is_me ?
                        <div>
                            <li className={classes} onClick={this.handleFollow}>
                                <div className="profile-header-nav-title" style={{ color: "rgb(140,140,140)" }} >{btnTitle}</div>
                                {!this.am_following ?
                                    <span>
                                        <span className="follow-button-plus">+</span>
                                        <img style={{ display: "none"}} className="follow-button-checkmark" src="/static/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                    </span>
                                        :
                                    <span>
                                        <span style={{ display: "none"}} className="follow-button-plus">+</span>
                                        <img className="follow-button-checkmark" src="/static/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                    </span>
                                }
                            </li>
                        </div>
                        : null}
                </ul>
            </div>
        );
    }
});

module.exports = UserBar;
