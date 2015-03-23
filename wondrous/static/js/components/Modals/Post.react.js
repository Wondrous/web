var WondrousActions = require('../../actions/WondrousActions');
var linkify = require('../../utils/Linkify');
var PostStore = require('../../stores/PostStore');
var UserTitle = require('./UserTitle.react');
var Photo = require('./Photo.react');
var CommentBox = require('./CommentBox.react');
var PostFooter = require('./PostFooter.react');
var checkLogin = require('../../utils/Func').checkLogin;

var Post = React.createClass({

    handleClose: function(evt) {
        if (checkLogin()) {
            WondrousActions.closeCardModal();
        } else {
            evt.preventDefault();
        }
    },

    viewLikedUsers: function() {
        PostStore.loadMoreLikedUsers();
        WondrousActions.openLikedUserModal();
    },

    handleUsernameClick: function(evt) {
        if (typeof this.props.data.username !== 'undefined') {
            if (checkLogin()) {
                WondrousActions.closeCardModal();
            } else {
                evt.preventDefault();
            }
        }
    },

	render: function() {
		var repost = null;
		if (typeof this.props.data === 'undefined' || this.props.data.subject==0) {
			return (
				<div></div>
			);
		}

		if (this.props.data.hasOwnProperty('repost')) {
			repost = this.props.data.repost;
			this.props.data.text = repost.text;
			this.props.data.subject = repost.subject;
		}

		var thisText = linkify(this.props.data.text, false);
        var likedUsers = [];
        if (this.props.data.like_count < 10) {
            this.props.data.handleUsernameClick = this.handleUsernameClick;
            PostStore.loadMoreLikedUsers();

            if (this.props.data.like_count == 0) {
                likedUsers = "Be the first to like this";
            } else {
                likedUsers = PostStore.likedUsers.sortedSet.map(function(user, ind) {
                    var thisUsernameLink = (<Link key={ind} className="post-like-username" onClick={this.handleUsernameClick} to={"/"+user.username} title={user.name+" (@"+user.username+") liked this post"}>{user.name}</Link>);
                    if (ind == this.like_count-1) {
                        return (thisUsernameLink);
                    }
                    return (<span>{thisUsernameLink}, </span>);
                }, this.props.data);
            }
        }

		return (
			<div ref="post"  className="post-body post-body--nohover round-3" >
				<div style={{ backgroundColor: "#FFFFFF", position: "relative" }}>
					<UserTitle data={this.props.data} />
				</div>

				<div className="post-title post-title-big" style={{ marginLeft: 28, marginRight: 28 }}>
                    {this.props.data.subject}
                </div>

				<div id="slidePhoto" onClick={this.handleClose} >
					<Photo ref="photo" data={this.props.data}/>
				</div>

                <div>
                    <div className="post-modal-micro-data-wrapper" style={{ maxWidth: "60%" }}>
                        <span className="post-micro-data-super-analytics-item">
                            <img src="/static/pictures/icons/view/eye_gray_shadow.svg" className="post-general-icon post-view-icon" />
                            {this.props.data.view_count}
                        </span>

                        <span className="post-micro-data-super-analytics-item">
                            <img src="/static/pictures/icons/comment/cloud_gray_shadow.svg" className="post-general-icon post-view-icon" />
                            {this.props.data.comment_count}
                        </span>

                        <span onClick={this.props.data.like_count > 10 ? this.viewLikedUsers : null} className="post-micro-data-super-analytics-item" style={{ display: "block", paddingLeft: 2 }}>
                           {this.props.data.liked ?
                                <span>
                                    <img src="/static/pictures/icons/like/heart_red.svg" className="post-general-icon post-like-icon" />
                                    <img src="/static/pictures/icons/like/heart_gray_shadow.svg" className="post-general-icon post-like-icon" style={{ display: "none" }} />
                                </span>
                                :
                                <span>
                                    <img src="/static/pictures/icons/like/heart_red.svg" className="post-general-icon post-like-icon" style={{ display: "none" }} />
                                    <img src="/static/pictures/icons/like/heart_gray_shadow.svg" className="post-general-icon post-like-icon" />
                                </span>
                            }

                            {this.props.data.like_count <= 10 ? likedUsers : this.props.data.like_count}
                            {this.props.data.like_count > 10 ? " likes" : {}}
                        </span>
                    </div>

                    <hr style={{  width: "60%", margin: "0 28px", height: 2, borderColor: "rgb(234,234,234)" }} />
                </div>
				<div className="post-content">
					{thisText}
				</div>

                <hr style={{  width: "60%", margin: "1.1em 0", marginBottom: -2, marginLeft: 16 }} />

                <div className="post-comment-wrapper">
                    <CommentBox post_id={this.props.data.id} data={this.props.comments} />
                </div>

                <PostFooter data={this.props.data} />
			</div>
		);
	}
});

module.exports = Post;
