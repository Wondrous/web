var WondrousActions = require('../../actions/WondrousActions');
var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');

var InfluenceStats = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [ Reflux.listenTo(ProfileStore,"onProfileChange") ],
    
    onProfileChange: function(profileData){
        // console.log("profile changed", profileData);
    },
    
    am_following: ProfileStore.user.following,
    is_private: ProfileStore.user.is_private,

    getInitialState: function() {
        return {data: ProfileStore.user};
    },

    beautifyNumber: function(number) {
        if (isNaN(number)) {
            return 0;
        } else if (number < 1) {
            return "less than 1";
        } else {
            return Math.round(number * 10) / 10;
        }
    },

    render: function() {
        var username = this.context.router.getCurrentParams().username;
        var is_me = username === UserStore.user.username;
        if (is_me) {
            var view_count = this.state.data.view_count;
            var post_count = this.state.data.post_count;
            var like_count = this.state.data.like_count;
            var follower_count = this.state.data.follower_count - 1;
            var following_count = this.state.data.following_count - 1;
            var total_connections = follower_count + following_count;

            var avg_view_count = this.beautifyNumber(view_count / post_count);
            var avg_like_count = this.beautifyNumber(like_count / post_count);
            var avg_likes_per_100_views = this.beautifyNumber( (like_count / view_count) * 100);

            return (
                <div className="profile-analytics-wrapper">
                    <h2 className="profile-analytics-header" title="Profile Analyics (private to you)">
                        Profile Analyics <span style={{ color: "rgb(121,121,121)", fontFamily: "heydings_iconsregular" }}>L</span>
                    </h2>
                    <div className="profile-analytics-item">
                        <h2 className="profile-analytics-item-header">
                            Followers <span className="profile-analytics-ffkey profile-analytics-ffbar--left"></span> to Following <span className="profile-analytics-ffkey profile-analytics-ffbar--right"></span> Ratio
                        </h2>
                        {follower_count > 0 || following_count > 0 ?
                            <div title="Your followers to following ratio (followers : following)">
                                <span className="profile-analytics-ffbar profile-analytics-ffbar--left" style={{ width: follower_count / total_connections * 100 +"%" }}></span>
                                <span className="profile-analytics-ffbar profile-analytics-ffbar--right" style={{ width: following_count / total_connections * 100 +"%" }}></span>
                            </div>
                            :
                            <div>
                                <span style={{ color: "rgb(100,100,100)", fontSize: 13, fontStyle: "italic" }}>
                                    Not enough data to display anything
                                </span>
                            </div>
                        }
                    </div>

                    <div className="profile-analytics-item">
                        <div className="profile-analytics-number" title="Total number posts">
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/newpost/newpost_gray_shadow.svg" className="post-general-icon post-view-icon" style={{ height: "55px !important", width: "55px !important", marginRight: 5 }} />
                            <span style={{ paddingLeft: 10 }}>{post_count}</span>
                        </div>
                    </div>

                    <div className="profile-analytics-item">
                        <div className="profile-analytics-number" title="Total number of views on your posts">
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/view/eye_gray_shadow.svg" className="post-general-icon post-view-icon" style={{ height: "60px !important", width: "60px !important" }} />
                            <span style={{ paddingLeft: 10 }}>{view_count}</span>
                        </div>
                        <div className="profile-analytics-sub-item">
                            <span>Avg. views per post: </span>
                            <span className="profile-analytics-sub-number">{avg_view_count}</span>
                        </div>
                    </div>
                    
                    <div className="profile-analytics-item">
                        <div className="profile-analytics-number" title="Total number of likes on your posts">
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_red.svg" className="post-general-icon post-like-icon" style={{ height: "60px !important", width: "60px !important" }} />
                            <span style={{ paddingLeft: 10 }}>{like_count}</span>
                        </div>
                        <div className="profile-analytics-sub-item">
                            <span>Avg. likes per post: </span>
                            <span className="profile-analytics-sub-number">{avg_like_count}</span>
                        </div>
                        <div className="profile-analytics-sub-item">
                            <span>Avg. likes per 100 views: </span>
                            <span className="profile-analytics-sub-number">{avg_likes_per_100_views}</span>
                        </div>
                    </div>

                    <div style={{ height: 100 }}></div>
                </div>
            );
        } else {
            return (
                <div className="private-profile-content">
                    <div>You can only view your own profile's analytics</div>
                    <div className="private-profile-content-sub round-5" style={{ margin: "10px 10%", padding: 20, fontSize: 14, backgroundColor: "rgb(251,251,251)", color: "rgb(51,51,51)" }}>
                        <div style={{ fontWeight: 900, padding: "0 0 15px", fontSize: 16 }}>
                            What is this "Influence" score?
                        </div>
                        
                        Good question! This number is unique to Wondrous. It takes into account various factors
                        (such as the quality of your posts, how much interaction they get, etc.) that are
                        then combined into one perfect number which summarizes how "influential"
                        you are. Everyone starts at <b>1</b>, and once you reach <b style={{ color: "rgb(0,196,144)" }}>75</b>, you earn the respected green "influencer" badge.

                        <div style={{ fontSize: 20, fontWeight: 900, padding: "10px 0", fontFamily: "courier" }}>
                            More Followers + Healthy Interaction = <span style={{ color: "rgb(0,206,174)" }}>More Influence</span>
                        </div>

                        <div>
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/newpost/newpost_gray_shadow.svg" className="post-general-icon post-view-icon" style={{ height: "55px !important", width: "55px !important", marginRight: 5 }} />
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/view/eye_gray_shadow.svg" className="post-general-icon post-view-icon" style={{ height: "60px !important", width: "60px !important" }} />
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_red.svg" className="post-general-icon post-like-icon" style={{ height: "60px !important", width: "60px !important" }} />
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/comment/cloud_gray_shadow.svg" className="post-general-icon post-like-icon" style={{ height: "60px !important", width: "60px !important" }} />
                        </div>

                        <div style={{ fontSize: 16, fontWeight: 900, paddingTop: 10 }}>Have fun!</div>
                    </div>
                </div>
            );
        }
    }
});

module.exports = InfluenceStats;
