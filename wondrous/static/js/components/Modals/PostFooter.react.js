var WondrousActions = require('../../actions/WondrousActions');
var WondrousAPI = require('../../utils/WondrousAPI');
var PostStore = require('../../stores/PostStore');
var UserStore = require('../../stores/UserStore');
var checkLogin = require('../../utils/Func').checkLogin;

var PostFooter = React.createClass({

    deletePost: function() {
        WondrousActions.closeCardModal();
        WondrousActions.deletePost(this.props.data.id);
    },

    editPost: function(){
        WondrousActions.openPostModal();
        WondrousActions.editPost(this.props.data);
    },

    reportPost: function(e) {
        if (!checkLogin()) return;
        WondrousActions.togglePostReport(this.props.data.id);
    },

    onLikeHandler: function(err, res) {
        if (err == null) {
            PostStore.post.liked = this.props.data.liked;
            if (PostStore.post.liked) {
                PostStore.post.like_count++;
            } else {
                PostStore.post.like_count--;
            }
            WondrousActions.updatePostOnWall();
            WondrousActions.updatePostOnFeed();
            WondrousActions.updatePostOnModal();
        }
    },

    likePost: function() {
        if (!checkLogin()) {
            return;
        }

        this.props.data.liked = !this.props.data.liked;
        if(this.props.data.liked){
            PostStore.likedUsers.push(UserStore.user);
        }else{
            PostStore.likedUsers.delete(UserStore.user);
        }

        this.forceUpdate();

        WondrousAPI.toggleLike({
            post_id: this.props.data.id,
            callback: this.onLikeHandler,
        });
    },

    clickRepost: function() {
        if (!checkLogin()) {
            return;
        }
        WondrousActions.repost(this.props.data.id);
    },

    render: function(){
        var is_it_mine = (this.props.data.username === UserStore.user.username);
        var original_mine = is_it_mine&&(this.props.data.repost==null);
        return (
            <div className="post-footer" style={{ paddingBottom: 0 }}>
                <span onClick={this.likePost} className="post-footer-btn post-like-btn round-50" title="Like this post">
                    {this.props.data.liked ?
                        <span>
                            <img src="/static/pictures/icons/like/heart_red.svg" className="post-general-icon postHeartIcon" />
                            <img src="/static/pictures/icons/like/heart_white.svg" className="post-general-icon postHeartIcon" style={{ display: "none" }} />
                        </span>
                        :
                        <span>
                            <img src="/static/pictures/icons/like/heart_red.svg" className="post-general-icon postHeartIcon" style={{ display: "none" }} />
                            <img src="/static/pictures/icons/like/heart_white.svg" className="post-general-icon postHeartIcon" />
                        </span>
                    }
                </span>

                {!is_it_mine ?
                    <span onClick={this.clickRepost} className="post-footer-btn post-like-btn round-50" title="Repost this post">
                        <img src="/static/pictures/icons/repost/repost_white.svg" className="post-general-icon" />
                    </span>
                    : null}

                <span onClick={WondrousActions.togglePostLink} className="post-footer-btn post-like-btn round-50" style={{ position: "relative", top: -13 }} title="Get link to this post">
                    <img src="/static/pictures/icons/link/link.png" className="post-delete-icon" />
                </span>

                {PostStore.postLink != null ?
                    <input className="post-share-link-input round-2" type='text' value={PostStore.postLink} readOnly/>
                    : {}}

                <span onClick={WondrousActions.toggleMoreOptions} className="post-footer-btn post-options-btn round-50 nh" title="See more options">
                    {'\u2022\u2022\u2022'}
                </span>

                {PostStore.moreOptions ?
                    <span className="post-options-wrapper round-3">
                        {!is_it_mine ?
                            <span onClick={this.reportPost} className="post-footer-btn post-delete-btn round-50" style={{ margin: 0 }} title="Report this post">
                                <span style={{ position: "relative", top: 10, fontFamily: "heydings_iconsregular", fontSize: 17  }} >f</span>
                            </span>
                            : null}


                        {is_it_mine ?
                            <span onClick={this.deletePost} className="post-footer-btn post-delete-btn round-50" style={{ margin: "0 5px" }} title="Delete this post">
                                <img src="/static/pictures/icons/delete/trash.png" className="post-delete-icon" />
                            </span>
                            : null}

                        {original_mine ?
                            <span onClick={this.editPost} className="post-footer-btn post-like-btn post-edit-btn round-50" style={{ margin: "0 5px" }} title="Edit this post">
                                Edit
                            </span>
                            : null}
                    </span>
                    : null}
            </div>
        );
    }
});

module.exports = PostFooter;
