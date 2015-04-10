var WondrousActions = require('../../actions/WondrousActions');
var linkify = require('../../utils/Linkify');
var PostStore = require('../../stores/PostStore');
var UserTitle = require('./UserTitle.react');
var Photo = require('./Photo.react');
var CommentBox = require('./CommentBox.react');
var PostFooter = require('./PostFooter.react');
var checkLogin = require('../../utils/Func').checkLogin;

var Post = React.createClass({
    mixins: [Reflux.connect(PostStore)],
    getInitialState: function(){
        return PostStore.getPostState();
    },

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
        if (typeof this.state.post.username !== 'undefined') {
            if (checkLogin()) {
                if(!evt.metaKey){
                    WondrousActions.closeCardModal();
                }
            } else {
                evt.preventDefault();
            }
        }
    },

	render: function() {
		var repost = null;
		if (typeof this.state.post === 'undefined' || this.state.post.subject==0) {
			return (
				<div></div>
			);
		}

		if (this.state.post.hasOwnProperty('repost')) {
			repost = this.state.post.repost;
			this.state.post.text = repost.text;
			this.state.post.subject = repost.subject;
		}

		var thisText = linkify(this.state.post.text, null);
        var likedUsers = [];
        if (this.state.post.like_count < 10) {
            this.state.post.handleUsernameClick = this.handleUsernameClick;
            PostStore.loadMoreLikedUsers();

            if (this.state.post.like_count == 0) {
                likedUsers = "Be the first to like this";
            } else {
                likedUsers = PostStore.likedUsers.sortedSet.map(function(user, ind) {
                    var thisUsernameLink = (<Link key={ind} className="post-like-username" onClick={this.handleUsernameClick} to={"/"+user.username} title={user.name+" (@"+user.username+") liked this post"}>{user.name}</Link>);
                    if (ind == this.like_count-1) {
                        return (thisUsernameLink);
                    }
                    return (<span>{thisUsernameLink}, </span>);
                }, this.state.post);
            }
        }

		return (
			<div ref="post"  className="post-body post-body--nohover round-3" >
				<div style={{ backgroundColor: "#FFFFFF", position: "relative" }}>
					<UserTitle data={this.state.post} />
				</div>

				<div className="post-title post-title-big" style={{ marginLeft: 28, marginRight: 28 }}>
                    {this.state.post.subject}
                </div>

				<div id="slidePhoto" onClick={this.handleClose} >
					<Photo ref="photo" data={this.state.post}/>
				</div>

                <div>
                    <div className="post-modal-micro-data-wrapper" style={{ maxWidth: "100%" }}>
                        {/*
                        <span className="post-micro-data-super-analytics-item">
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/view/eye_gray_shadow.svg" className="post-general-icon post-view-icon" />
                            {this.state.post.view_count}
                        </span>

                        <span className="post-micro-data-super-analytics-item">
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/comment/cloud_gray_shadow.svg" className="post-general-icon post-view-icon" />
                            {this.state.post.comment_count}
                        </span>
                        */}

                        <span onClick={this.state.post.like_count > 10 ? this.viewLikedUsers : null} className="post-micro-data-super-analytics-item" style={{ display: "block", padding: "5px 0 5px 2px"   }}>
                           {this.state.post.liked ?
                                <span>
                                    <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_red.svg" className="post-general-icon post-like-icon" />
                                    <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_gray_shadow.svg" className="post-general-icon post-like-icon" style={{ display: "none" }} />
                                </span>
                                :
                                <span>
                                    <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_red.svg" className="post-general-icon post-like-icon" style={{ display: "none" }} />
                                    <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_gray_shadow.svg" className="post-general-icon post-like-icon" />
                                </span>
                            }

                            {this.state.post.like_count <= 10 ? likedUsers : this.state.post.like_count}
                            {this.state.post.like_count > 10 ? " likes" : {}}
                        </span>
                    </div>

                    <hr style={{  width: "60%", margin: "0 28px", height: 2, borderColor: "rgb(234,234,234)" }} />
                </div>
				<div className="post-content">
					{thisText}
				</div>

                <PostFooter data={this.state.post} />

                {/*<hr style={{  width: "60%", margin: "1.1em 0", marginBottom: -2, marginLeft: 16 }} />*/}

                <div className="post-comment-wrapper">
                    <CommentBox post_id={this.state.post.id} />
                </div>
			</div>
		);
	}
});

module.exports = Post;
