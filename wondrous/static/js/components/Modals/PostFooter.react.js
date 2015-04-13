var WondrousActions = require('../../actions/WondrousActions');
var WondrousAPI = require('../../utils/WondrousAPI');
var PostStore = require('../../stores/PostStore');
var UserStore = require('../../stores/UserStore');
var ModalStore = require('../../stores/ModalStore');
var checkLogin = require('../../utils/Func').checkLogin;
var WondrousConstants = require('../../constants/WondrousConstants');

var PostFooter = React.createClass({
    deleteClicked: false,
    mixins: [Reflux.listenTo(ModalStore,'onModalChange')],
    onModalChange: function(modalProp){
        if(modalProp.dialogueAccept==true&&this.deleteClicked==true){
            ModalStore.dialogueAccept=false;
            this.deleteClicked = false;
            this.deletePost();
        }else if(modalProp.dialogueOpen==false){
            this.deleteClicked = false;
        }
    },

    onDeleteClick: function(e){
        this.deleteClicked = true;
        WondrousActions.openDialogue("Are you sure you want to delete this post?", null, WondrousConstants.DIALOGUE_INPUT);
    },

    deletePost: function() {
        WondrousActions.closeCardModal();
        WondrousActions.deletePost(this.props.data.id);
        this.deleteClicked = false;
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
        if(this.props.data.repost!=null){
            this.props.data.subject = this.props.data.repost.subject;
        }
        var urlLink = "wondrous.co/post/"+this.props.data.id;
        var facebookLink = "http://facebook.com/sharer.php?u="+encodeURIComponent(urlLink);
        var twitterLink = "http://twitter.com/intent/tweet?url="+encodeURIComponent(urlLink+"&text="+this.props.data.subject+"&via=Wondrous");
        return (
            <div className="post-footer" style={{ paddingBottom: 0 }}>
                <span onClick={this.likePost} className="post-footer-btn post-like-btn round-50" title="Like this post">
                    {this.props.data.liked ?
                        <span>
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_red.svg" className="post-general-icon postHeartIcon" />
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_white.svg" className="post-general-icon postHeartIcon" style={{ display: "none" }} />
                        </span>
                        :
                        <span>
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_red.svg" className="post-general-icon postHeartIcon" style={{ display: "none" }} />
                            <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/like/heart_white.svg" className="post-general-icon postHeartIcon" />
                        </span>
                    }
                </span>

                {!is_it_mine ?
                    <span onClick={this.clickRepost} className="post-footer-btn post-like-btn round-50" title="Repost this post">
                        <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/repost/repost_white.svg" className="post-general-icon" />
                    </span>
                    : null}

                <span onClick={WondrousActions.togglePostLink} className="post-footer-btn post-like-btn round-50" style={{ position: "relative", top: -13 }} title="Get link to this post">
                    <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/link/link.png" className="post-delete-icon" />
                </span>

                {PostStore.postLink != null ?
                    <input className="post-share-link-input round-2" type='text' value={PostStore.postLink} readOnly/>
                    : {}}

                <a href="javascript:" onClick={function(evt) { return window.open(facebookLink, '_blank', 'width=400,height=500') }} >
                    <img className="post-footer-btn round-50" style={{ position: "relative", top: 7 }} src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/social/social-facebook.png" title="Share this post to Facebook" />
                </a>

                <a href="javascript:" onClick={function(evt) { return window.open(twitterLink, '_blank', 'width=400,height=500') }} >
                    <img className="post-footer-btn round-50" style={{ position: "relative", top: 7 }} src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/social/social-twitter.png" title="Share this post to Twitter" />
                </a>

                <span onClick={WondrousActions.toggleMoreOptions} className="post-footer-btn post-options-btn round-50 nh" style={{ paddingTop: "3px" }} title="See more options">
                    +
                </span>

                {PostStore.moreOptions ?
                    <span className="post-options-wrapper round-3">
                        {!is_it_mine ?
                            <span onClick={this.reportPost} className="post-footer-btn post-delete-btn round-50" style={{ margin: 0 }} title="Report this post">
                                <span style={{ position: "relative", top: 10, fontFamily: "heydings_iconsregular", fontSize: 17  }} >f</span>
                            </span>
                            : null}


                        {is_it_mine ?
                            <span onClick={this.onDeleteClick} className="post-footer-btn post-delete-btn round-50" style={{ margin: "0 5px" }} title="Delete this post">
                                <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/delete/trash.png" className="post-delete-icon" />
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
