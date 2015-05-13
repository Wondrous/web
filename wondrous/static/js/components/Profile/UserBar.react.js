var WondrousActions = require('../../actions/WondrousActions');
var WondrousAPI = require('../../utils/WondrousAPI');
var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');
var ProfileBarBadge = require('./ProfileBarBadge.react');
var InfluencerBadge = require('./InfluencerBadge.react');
var InformationBanner = require('../InformationBanner.react');
var linkify = require('../../utils/Linkify');

var URLGenerator = require('../../utils/URLGenerator');

var UserBar = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    mixins: [
        Reflux.listenTo(ProfileStore, 'onProfileChange')
    ],

    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    onProfileChange: function(profileData) {
        this.setState({
            data: ProfileStore.user
        });
    },

    getInitialState: function() {
        return {data: ProfileStore.user, editing:false};
    },

    handleData: function(err, data) {
        if (err === null){
            var currentState = this.state.data;
            currentState.following = data.following === true;
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
        });
    },

    handleClick: function() {
        var is_me = this.props.username === UserStore.user.username;
        if (is_me) {
            WondrousActions.openPictureModal();
        }
    },

    onEdit: function() {
        var is_me = this.props.username === UserStore.user.username;
        this.setState({data: ProfileStore.user, editing:is_me});
    },

    onSubmitDescription: function(evt){
        evt.preventDefault();
        var description = this.refs.descriptionBox.getDOMNode().value;
        var that = this;
        WondrousAPI.changeDescription({
            description: description,
            callback:function(err, res) {
                if (err === null) {
                    ProfileStore.user.description = description;
                    that.setState({
                        data: ProfileStore.user,
                        editing: false
                    });
                }
            }
        });
    },

    render: function() {
        this.is_private = ProfileStore.user.is_private;
        this.am_following = this.state.data.following === true;

        var username = this.props.username;
        var is_me = username === UserStore.user.username;
        var ouuid = (typeof ProfileStore.user.ouuid !== 'undefined') ? ProfileStore.user.ouuid : null;
        var img_src = ouuid ? URLGenerator.generate150(ouuid) : "https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/defaults/p.default-profile-picture.jpg";
        var classes = "profile-header-nav-item wondrous-connect-btn round-50 ";
        var is_influencer = (this.state.data.wondrous_score >= 75);
        var wondrousScore = this.state.data.wondrous_score;

        if (this.am_following) {
            var btnTitle = "following";
            classes += "is-following";
        } else {
            var btnTitle = "follow";
            classes += "not-following";
        }

        return (

            <span>
                {is_me && !ouuid ?
                    <InformationBanner
                        bannerType="alert"
                        actionType="uploadProfilePicture"
                        canExit="false"
                        text="Don't forget to upload a profile photo!"
                        styles={{ margin: 0, cursor: "pointer" }}
                        />
                    : null}
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

                        {this.state.editing ?
                            <form onSubmit={this.onSubmitDescription}>
                                <textarea className="profile-about-textarea profile-about--font" ref="descriptionBox" placeholder="Tell us something about yourself!">
                                    {this.state.data.description.length > 0 ? this.state.data.description : null}
                                </textarea>
                                <div><input className="post-comment-btn" type="submit" value="Save" /></div>
                            </form>
                            :
                            <span>
                                {this.state.data.description.length > 0 ?
                                    <div className="profile-about profile-about--font">
                                        {linkify(this.state.data.description, "hashtagify--medium hashtagify--ghost")}
                                        {is_me ? <span className="profile-about--edit" onClick={this.onEdit}>Edit</span> : null}
                                    </div>
                                    :
                                    <span>
                                        {is_me ? <div className="profile-about--edit profile-about--edit-prompt" onClick={this.onEdit}>Add a description about yourself</div> : null}
                                    </span>
                                }
                            </span>
                        }
                    </div>
                    <hr className="profile-hr" />
                    <ul className="profile-header-nav">
                        <ProfileBarBadge to={"wall"} name={"posts"} number={this.state.data.post_count} username={this.state.data.username} />
                        <ProfileBarBadge to={"followers"} name={"followers"} number={this.state.data.follower_count-1} username={this.state.data.username} />
                        <ProfileBarBadge to={"following"} name={"following"} number={this.state.data.following_count-1} username={this.state.data.username} />
                        <ProfileBarBadge to={"stats"} name={"influence"} number={wondrousScore} username={this.state.data.username} />

                        {!is_me ?
                            <div>
                                <li className={classes} onClick={this.handleFollow}>
                                    <div className="profile-header-nav-title" style={{ color: "rgb(140,140,140)" }} >{btnTitle}</div>
                                    {!this.am_following ?
                                        <span>
                                            <span className="wondrous-connect-btn-plus">+</span>
                                            <img style={{ display: "none"}} className="wondrous-connect-btn-checkmark" src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                        </span>
                                            :
                                        <span>
                                            <span style={{ display: "none"}} className="wondrous-connect-btn-plus">+</span>
                                            <img className="wondrous-connect-btn-checkmark" src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/checkmark/checkmark-1.png?v=1" />
                                        </span>
                                    }
                                </li>
                            </div>
                            : null}
                    </ul>
                </div>
            </span>
        );
    }
});

module.exports = UserBar;
