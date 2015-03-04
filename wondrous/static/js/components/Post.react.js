var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var PostStore = require('../stores/PostStore');
var UserStore = require('../stores/UserStore');


var UserTitle = React.createClass({
    repost: null,
    mixins: [Router.Navigation],

    handleProfileData: function(err, data) {
        if (err == null) {
            console.log("Profile from post", data);
            WondrousActions.loadProfileInfo(data);
        } else {
            // WondrousActions.unloadUserInfo(err);
        }
    },

    handleWallData: function(err, data) {
        if (err == null) {
            WondrousActions.loadWallPosts(data);
            console.log("Wall from post", data);
        } else {

        }
    },

    loadProfileFromServer: function(username) {
        if (typeof username ==='undefined') username=this.props.data.username;
        WondrousAPI.getUserInfo({
            username: username,
            callback: this.handleProfileData
        });
    },

    loadWallFromServer: function(username) {
        if (typeof username === 'undefined') username=this.props.data.username;
        WondrousAPI.getWallPosts({
            username: username,
            page: 0,
            callback: this.handleWallData
        });
    },

    handleClick: function() {
        if (typeof this.props.data.username != 'undefined') {
            this.transitionTo('/' + this.props.data.username);
            this.loadProfileFromServer();
            this.loadWallFromServer();
        }
    },

    handleClickOnOwner: function(){
        if (typeof this.repost.username != 'undefined') {
            this.transitionTo('/' + this.repost.username);
            this.loadProfileFromServer(this.repost.username);
            this.loadWallFromServer(this.repost.username);
        }
    },

    render: function() {
        var name = this.props.data.name;
        if (this.props.data.hasOwnProperty('repost')) {
            this.repost = this.props.data.repost;
        }
        var img_src = (typeof this.props.data.user_ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.user_ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
        return (
            <div>
                <img ref="usericon" className="post-thumb round-50" src={img_src}/>
                <span className="post-identifier ellipsis-overflow">
                    <a onClick={this.handleClick}>{name}</a>
                    {this.repost ? " reposted from " : null}
                    {this.repost ? <a className="recipient" onClick={this.handleClickOnOwner}>{this.repost.name}</a>:null}
                </span>
            </div>
            );
    }
});

var Comment = React.createClass({

    render: function() {
        var img_src = (typeof this.props.data.ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";

        return (
            <div className="post-comment">
                <div className="post-comment-image-wrapper round-2">
                    <img className="round-2" style={{"height": 25, "width": 25}} src={img_src} />
                </div>
                <div className="post-comment-content">
                    <a href="#" className="post-comment-un" onClick={this.handleClick}>{this.props.data.name}</a>
                    <span>{this.props.data.text}</span>
                </div>
            </div>
        );
    }
});

var Comments = React.createClass({
    handleCommentPost: function(err,res){
        if (err == null){
            console.log("you have successfully posted a comment" ,res);
            this.refs.commentBox.getDOMNode().value = ''
            this.refs.commentBox.getDOMNode().blur();
            this.props.data.push(res);
            this.forceUpdate();
        } else {

        }
    },
    onComment: function(evt){
        evt.preventDefault();
        var text = this.refs.commentBox.getDOMNode().value.trim();
        WondrousAPI.commentOnPost({
            text:text,
            post_id: this.props.post_id,
            callback: this.handleCommentPost
        })
    },
    render: function() {
        console.log(this.props.data);
        var comments = this.props.data.map(function(comment, index) {
            return (
                <Comment data={comment}/>
            );
        });
        return (
            <div>
                {comments}
                <div>
                    <form onSubmit={this.onComment}>
                        <input ref="commentBox" placeholder="your comment?"></input>
                    </form>
                </div>
            </div>
            );
    }
});

var Photo = React.createClass({

    render: function() {
        if (this.props.data.hasOwnProperty('repost')) {
            this.props.data = this.props.data.repost;
        }
        photoStyle = {
            backgroundImage: this.props.data.ouuid ? "url(http://mojorankdev.s3.amazonaws.com/" + this.props.data.ouuid+")" : "/static/pictures/500x500.gif",
        };

        // var img_src = this.props.data.ouuid ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.ouuid : "/static/pictures/500x500.gif";
        return (
            <div ref="container" className="post-cover-photo cover no-top-border nh" style={photoStyle}>
                    {/*<div className="post-subject-text nh">
                        <div className="post-subject-wrapper">
                            <div className="post-subject-text-position">
                                {this.props.data.subject}
                            </div>
                        </div>
                    </div>*/}
            </div>);
    },
    componentDidMount: function() {
        // Nothing much happening here!!!
    }
});

var Post = React.createClass({
    getInitialState: function() {
        return {comments: [], commentsVisible:false};
    },
    handleClick: function() {
        var SPEED = 0;
        var thisPost = $(this.refs.post.getDOMNode());
        var thisBrick = $(this.refs.brick.getDOMNode());
        var thisPostContent = thisPost.find('.post-content');
        var thisCoverPhoto = thisPost.find('.post-cover-photo');

        $('.backdrop').toggleClass('dimmer');
        thisPost.css('z-index', 9);

        $('.post-body').not(thisPost).removeClass('is-expanded');
        $('.post-content').not(thisPostContent).slideUp(SPEED);
        $('.post-cover-photo').not(thisCoverPhoto).removeClass('no-bottom-border');
        $('.post-content').not(thisPostContent).removeClass('no-top-border');
        $('.masonry-brick').not(thisBrick).removeClass('post-presentation');

        thisPost.toggleClass('is-expanded');
        thisPost.find('.pseudo-bg-img').toggleClass('pseudo-bg-img-closed').toggleClass('pseudo-bg-img-expanded');
        thisPost.find('.post-cover-photo').toggleClass('no-bottom-border');
        thisPostContent.toggleClass('no-top-border');

        thisBrick.toggleClass('post-presentation');
        thisPostContent.slideToggle(SPEED);

        // Hmmmmm.... Let's try this out
        $('html, body').animate({ scrollTop: thisBrick.offset().top-60 }, 300);

        // Trigger Masonry Layout
        // WondrousActions.toggleFeedAnimation(null);
    },

    handleData: function(err, res){
        if (err == null) {
            this.handleClick();
            WondrousActions.postDelete(res.id);
        } else {

        }
    },

    deletePost: function () {
        WondrousAPI.deletePost({
            post_id: this.props.data.id,
            callback: this.handleData
        });
    },

    handlePostLike: function(err, res) {
        if (err == null) {
            //console.log("liked",res);
            this.props.data.liked = res.like;
            this.forceUpdate();
        } else {

        }
    },

    likePost: function() {
        //console.log("liking post");
        WondrousAPI.toggleLike({
            post_id: this.props.data.id,
            callback: this.handlePostLike
        });
    },

    onViewComments: function(err, res) {
        if (err == null){
            console.log("loaded comments are",res);
            this.setState({comments: res});
        } else {
            console.error("problems with loading comments", err);
        }
    },

    onRepost: function(err, res) {
        if (err == null) {
            console.log("repost results",res);
            WondrousActions.addNewPost(res);
        } else {
            console.error("repost err", err);
        }
    },

    clickRepost: function() {
        uploadData = {
            'post_id' : this.props.data.id
        };

        //console.log("reposting", uploadData);

        WondrousAPI.repost({
            uploadData: uploadData,
            callback: this.onRepost
        });
        this.handleClick();
    },

    clickViewComments: function() {
        this.setState({commentsVisible: !this.state.commentsVisible});
        WondrousAPI.getPostComments({
            page: 0,
            post_id:this.props.data.id,
            callback: this.onViewComments
        });
    },

    render: function() {
        var repost = null;
        var is_it_mine = this.props.data.username === UserStore.getUserData().username;

        if (this.props.data.hasOwnProperty('repost')) {
            repost = this.props.data.repost;
            this.props.data.text = repost.text;
            this.props.data.subject = repost.subject;
        }

        var thisText = this.props.data.text.split('\n');
        return (
            <div ref="brick" className="masonry-brick">
                <div ref="post"  className="post-body round-3" >
                    <div style={{"backgroundColor": "#FFFFFF", "position":"relative"}}>
                        <UserTitle data={this.props.data} />
                    </div>
                    <div className="post-title">{this.props.data.subject}</div>
                    <div onClick={this.handleClick} id="slidePhoto">
                        <Photo ref="photo" data={this.props.data}/>
                    </div>
                    <div className="post-content" >
                        <div className="post-content-text">
                            {
                                thisText.map(function(textChunk, idx) {
                                    if (idx == thisText.length - 1) {
                                        return textChunk;
                                    } else {
                                        return (
                                            <span>{textChunk}<br/></span>
                                        );
                                    }
                                })
                            }
                        </div>
                        <hr style={{"width": "60%", "margin": "1.1em 0", "marginBottom": -2}}/>
                        {this.state.commentsVisible?
                            <div className="post-comment-wrapper">
                                <Comments data={this.state.comments} post_id={this.props.data.id} />
                            </div>
                            : null}

                        <div className="post-footer">
                            <span onClick={this.likePost} className="post-footer-btn post-like-btn round-50">
                                <img src={this.props.data.liked ? "/static/pictures/icons/like/heart_red.svg" : "/static/pictures/icons/like/heart_white.svg"} className="post-general-icon" />
                            </span>

                            <span onClick={this.clickViewComments} className="post-footer-btn post-like-btn round-50">
                                <img src="/static/pictures/icons/comment/cloud_white.svg" className="post-general-icon" />
                            </span>

                            {!is_it_mine ?
                                <span onClick={this.clickRepost} className="post-footer-btn post-like-btn round-50">
                                    <img src="/static/pictures/icons/repost/repost_white.svg" className="post-general-icon" />
                                </span>
                                : null}

                            {is_it_mine ?
                                <span onClick={this.deletePost} className="post-footer-btn post-delete-btn round-50">
                                    <img src="/static/pictures/icons/delete/trash.png" className="post-delete-icon" />
                                </span>
                                : null}
                        </div>
                    </div>
                </div>
            </div>);
    }
});

module.exports = Post;
