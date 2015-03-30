var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');
var ProfileBarBadge = require('./ProfileBarBadge.react');
var InfluencerBadge = require('./InfluencerBadge.react');
var WondrousAPI = require('../../utils/WondrousAPI');

var PrivateProfile = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [
        Reflux.listenTo(ProfileStore, 'onProfileChange')
    ],
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    getInitialState: function() {
        return {data: ProfileStore.user};
    },

    handleData: function(err, data){
        if (err == null){
            $('._rmPending').hide();
            $('._pendingTitle').html("Request<br/>Sent");
            $('._requestBtn').removeClass('not-following').addClass('is-pending');
        } else {
            console.error("error", err);
        }
    },

    handleClick :function(){
        user_id = this.props.user.id;
        //console.log("sending", this.props.user);

        if (!user_id && typeof user_id === 'undefined') return;
        WondrousAPI.toggleFollow({
            user_id: user_id,
            callback: this.handleData
        })
    },
    render: function() {
        var ouuid = (typeof this.state.data.ouuid !== 'undefined') ? this.state.data.ouuid : false;
        var img_src = ouuid ? URLGenerator.generate150(ouuid) : "https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/defaults/p.default-profile-picture.jpg";

        var is_influencer = (this.state.data.wondrous_score>=75);
        var wondrousScore = this.state.data.wondrous_score;

        var classes = "profile-header-nav-item follow-button round-50 _requestBtn ";
        if (this.am_following) {
            var btnTitle = "Following";
            classes += "is-following";
        } else {
            var btnTitle = "Follow";
            classes += "not-following";
        }

        return (
            <div>
                <div className="profile-header">
                    <img className="profile-photo round-50" src={img_src} />
                    <div className="profile-header-content">

                        {is_influencer ?
                            <InfluencerBadge size="large" />
                            : null}

                        <div className="profile-name">{this.props.user.name}</div>
                        <div className="profile-username">@{this.props.user.username}</div>
                    </div>
                    <hr className="profile-hr" />
                    <ul className="profile-header-nav">
                        <ProfileBarBadge to={"wall"} name={"posts"} number={this.state.data.post_count} username={this.state.data.username} />
                        <ProfileBarBadge to={"followers"} name={"followers"} number={this.state.data.follower_count-1} username={this.state.data.username} />
                        <ProfileBarBadge to={"following"} name={"following"} number={this.state.data.following_count-1} username={this.state.data.username} />
                        <ProfileBarBadge to={"wall"} name={"influence"} number={wondrousScore} username={this.state.data.username} />

                        <div>
                            <li className={classes} onClick={this.handleClick} style={{display:UserStore.loggedIn?"block":"none"}}>
                                <div className="profile-header-nav-title _pendingTitle" style={{ color: "rgb(140,140,140)" }} >{btnTitle}</div>
                                {!this.am_following ?
                                    <span className="_rmPending">
                                        <span className="follow-button-plus">+</span>
                                        <img style={{ display: "none"}} className="follow-button-checkmark" src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                    </span>
                                        :
                                    <span className="_rmPending">
                                        <span style={{ display: "none"}} className="follow-button-plus">+</span>
                                        <img className="follow-button-checkmark" src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                    </span>
                                }
                            </li>
                        </div>
                    </ul>
                </div>
                <div className="profile-content">
                    <div style={{ textAlign: "center", margin: "40px 0", color: "rgb(180,180,180)", fontWeight: 900, fontSize: 16 }}>
                        <div>This profile is private</div>
                        <div style={{ fontWeight: 400, fontSize: 14, margin: "10px 0" }}>You must be following this user to view, like, and comment on their posts</div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PrivateProfile;
