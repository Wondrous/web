var WondrousAPI = require('../utils/WondrousAPI');
var checkLogin = require('../utils/Func').checkLogin;
var WondrousActions = require('../actions/WondrousActions');
var PostStore = require('../stores/PostStore');
var UserStore = require('../stores/UserStore');
var ModalStore = require('../stores/ModalStore');
var ReportConstants = require('../constants/ReportConstants');
var LoggedOut = require('./Feed.react').LoggedOut;
var Link = Router.Link;

var linkify = function(rawText){
    var textChunks = rawText.split('\n');
    var handleClose = function(evt){
        WondrousActions.clearModal();
    }
    
    return textChunks.map(function(segment,ind){
        var tokens = segment.split(/(@\S*)|(#\S*)/g);
        for (var i = 0; i < tokens.length; i += 1) {
            if(typeof tokens[i]=='undefined'){
                continue;
            }

            var tk = tokens[i];

            var href = null;
            if (tk.indexOf('@')>-1){
                var temp = tk.replace('@','')
                href = '/'+temp
            }else if (tk.indexOf('#')>-1){
                var temp = tk.replace('#','')
                href = '/search/'+temp
            }

            if (href!=null){
                tokens[i] = <Link onClick={handleClose} to={'/'+href}>{tokens[i]}</Link>;
            }
        }

        if (ind == textChunks.length - 1) {
            return (<span>{tokens}</span>);
        } else {
            return (
                <span>{tokens}<br /></span>
            );
        }
    });
}

var UserTitle = React.createClass({
    repost: null,
    mixins: [ Router.Navigation ],

    handleClick: function(evt) {
        if (typeof this.props.data.username !== 'undefined') {
            if(checkLogin()){
                WondrousActions.closeCardModal();
            }else{
                evt.preventDefault();
            }
        }
    },

    handleClickOnOwner: function(evt) {
        if (typeof this.repost.username !== 'undefined') {
            if(checkLogin()){
                WondrousActions.closeCardModal();
            }else{
                evt.preventDefault();
            }
        }
    },

    render: function() {
        this.repost = null;
        if(typeof this.props.data === 'undefined'){
            return (<div></div>);
        }
        var name = this.props.data.name;
        var un = this.props.data.username;
        var hrefRepostPlaceholder = '';
        if (this.props.data.repost_id!=null) {
            this.repost = this.props.data.repost;
            hrefRepostPlaceholder = '/'+this.repost.username;
        }
        var img_src = (typeof this.props.data.user_ouuid !== 'undefined' ) ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.user_ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = '/'+this.props.data.username;

        return (
            <div>
                <img ref="usericon" className="post-thumb round-50" src={img_src}/>
                <span className="post-identifier ellipsis-overflow" style={this.repost ? {top:0} : null}>
                    <Link to={hrefPlaceholder} onClick={this.handleClick}>
                        {name} (@{un})
                    </Link>
                    {this.repost ? <img src="/static/pictures/icons/repost/repost_gray_shadow.svg" className="post-general-icon" style={{height: 22, width: 22, top: 7}} /> : null}
                    {this.repost ? <Link className="recipient" to={hrefRepostPlaceholder} onClick={this.handleClickOnOwner}>{this.repost.name} (@{this.repost.username})</Link> : null}
                </span>
            </div>
            );
    }
});

var Comment = React.createClass({
    mixins: [ Router.Navigation ],

    handleClick: function(evt) {
        if (typeof this.props.data.username !== 'undefined') {
            if (checkLogin()) {
                WondrousActions.closeCardModal();
            } else {
                evt.preventDefault();
            }
        }
    },

    onDelete: function() {
        WondrousActions.deleteComment(this.props.data.id);
    },

    reportComment: function() {
        if (!checkLogin()) return;
        WondrousActions.toggleCommentReport(this.props.data.id);
    },

    render: function() {
        var img_src = (typeof this.props.data.ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = "/" + this.props.data.username;
        var is_it_mine = (this.props.data.user_id == UserStore.user.id);
        var createdAt = moment(this.props.data.created_at);
        var mmtMidnight = moment().startOf('day');
        var createdAtDisplay = "";

        if (createdAt.isBefore(mmtMidnight)) {
            var mmtYear = moment().startOf('year');
            if (createdAt.isBefore(mmtYear)) {
                createdAtDisplay = createdAt.format("h:mma, MMM wo 'GG");
            } else {
                createdAtDisplay = createdAt.format("h:mma, MMM wo");
            }
        } else {
            createdAtDisplay = createdAt.format("h:mma");
        }

        var textLinked = linkify(this.props.data.text)
        return (
            <div className="post-comment">
                <div className="post-comment-image-wrapper round-2">
                    <img className="post-comment-img round-2" src={img_src} />
                </div>

                <div className="post-comment-content">
                    <Link to={'/' + this.props.data.username} onClick={this.handleClick} className="post-comment-un">
                        {this.props.data.name}
                        <span style={{ fontWeight: 100 }}> (@{this.props.data.username})</span>
                    </Link>

                    <span>{textLinked}</span>

                    <div className="post-comment-date">{createdAtDisplay}</div>

                    {is_it_mine ?
                    	<div className="post-comment-delete-btn" onClick={this.onDelete}>X</div>
                    	:
                        <div className="post-comment-delete-btn" onClick={this.reportComment}>f</div>}
                </div>
            </div>
        );
    },

    componentDidMount: function() {
    	$(".post-comment-delete-btn").hide();
		$(document).on({
		    mouseenter: function(e) {
				$(this).find(".post-comment-delete-btn").show();
		    },
		    mouseleave: function(e) {
				$(this).find(".post-comment-delete-btn").hide();
		    }
		}, '.post-comment');
    },
});

var Comments = React.createClass({
    // mixins:[Reflux.listenTo(PostStore,"postStoreChanged")],
    // postStoreChanged: function(){
    //     this.forceUpdate();
    // },

    onComment: function(evt){
        evt.preventDefault();
        if (!checkLogin()) return;
        var text = this.refs.commentBox.getDOMNode().value.trim();

        //console.log(text,this.props.post_id);

        if (text.length > 0) {
            WondrousActions.addNewComment(this.props.post_id,text);
            this.refs.commentBox.getDOMNode().value = '';
            this.refs.commentBox.getDOMNode().blur();
        } else {
            // Send out a friendly error: "Please add some text!"
        }
    },

    loadMoreComments: function(){
        PostStore.loadMoreComments();
    },

    render: function() {
        var comments = this.props.data.map(function(comment, index) {
            return (
                <Comment key={comment.id} data={comment}/>
            );
        });

        return (
            <div>
                {!PostStore.donePaging&&comments.length>0 ? <button className="post-comment-load-more" onClick={this.loadMoreComments}>Load more comments</button> : null}
                {comments}
                {comments.length == 0 ? <div className="post-no-comments">Be the first to share your thoughts!</div> : null}
                <form style={{ margin: "0 28px" }} >
                    <textarea className="comment-textarea" ref="commentBox" placeholder="Share your thoughts!"></textarea>
                    <input className="post-comment-btn" type="submit" value="Share" onClick={this.onComment}/>
                </form>
            </div>);
    }
});

var Photo = React.createClass({

	handleClose: function(evt){
        if (checkLogin()) {
            WondrousActions.closeCardModal();
        } else {
            evt.preventDefault();
        }
	},

    render: function() {
        if (this.props.data.hasOwnProperty('repost')) {
            this.props.data = this.props.data.repost;
        }

        photoStyle = {
            backgroundImage: this.props.data.ouuid!=null ? "url(http://mojorankdev.s3.amazonaws.com/" + this.props.data.ouuid+")" : "url(/static/pictures/500x500.gif)",
        };

        return (
            <div onClick={this.handleClose} ref="container" className="post-cover-photo cover no-top-border nh" style={photoStyle}>
            </div>
        );
    }
});

var PostFooter = React.createClass({

    deletePost: function() {
        WondrousActions.closeCardModal();
        WondrousActions.deletePost(this.props.data.id);
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
        }
    },

    likePost: function() {
        if (checkLogin()) {
            WondrousActions.closeCardModal();
        } else {
            return;
        }

        this.props.data.liked = !this.props.data.liked;
        this.forceUpdate();

        WondrousAPI.toggleLike({
            post_id: this.props.data.id,
            callback: this.onLikeHandler,
        });
    },

    clickRepost: function() {
        if (checkLogin()) {
            WondrousActions.closeCardModal();
        } else {
            return;
        }
        WondrousActions.repost(this.props.data.id);
    },

    render: function(){
        var is_it_mine = (this.props.data.username === UserStore.user.username);
        return (
            <div className="post-footer">
                <span onClick={this.likePost} className="post-footer-btn post-like-btn round-50">
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
                    <span onClick={this.clickRepost} className="post-footer-btn post-like-btn round-50">
                        <img src="/static/pictures/icons/repost/repost_white.svg" className="post-general-icon" />
                    </span>
                    : null}

                {!is_it_mine ?
                    <span onClick={this.reportPost} className="post-footer-btn post-delete-btn round-50">
                        <span style={{ position: "relative", top: 10, fontFamily: "heydings_iconsregular", fontSize: 17  }} >f</span>
                    </span>
                    : null}

                {is_it_mine ?
                    <span onClick={this.deletePost} className="post-footer-btn post-delete-btn round-50">
                        <img src="/static/pictures/icons/delete/trash.png" className="post-delete-icon" />
                    </span>
                    : null}
            </div>
        );
    }
});

var Post = React.createClass({

	render: function() {
		var repost = null;
		if (typeof this.props.data === 'undefined') {
			return (
				<div></div>
			);
		}

		if (this.props.data.hasOwnProperty('repost')) {
			repost = this.props.data.repost;
			this.props.data.text = repost.text;
			this.props.data.subject = repost.subject;
		}

        console.log("PostRender:", this.props.data);
		var thisText = linkify(this.props.data.text);

		return (
			<div ref="post"  className="post-body round-3" >
				<div style={{ backgroundColor: "#FFFFFF", position: "relative" }}>
					<UserTitle data={this.props.data} />
				</div>

				<div className="post-title post-title-big" style={{ marginLeft: 28, marginRight: 28 }}>
                    {this.props.data.subject}
                </div>

				<div onClick={this.handleClick} id="slidePhoto">
					<Photo ref="photo" data={this.props.data}/>
				</div>

                <div>
                    <div className="post-modal-micro-data-wrapper">
                        <span className="post-micro-data-super-analytics-item">
                            <img src="/static/pictures/icons/view/eye_gray_shadow.svg" className="post-general-icon post-view-icon" />
                            {this.props.data.view_count}
                        </span>

                        <span className="post-micro-data-super-analytics-item">
                            <img src="/static/pictures/icons/comment/cloud_gray_shadow.svg" className="post-general-icon post-view-icon" />
                            {this.props.data.comment_count}
                        </span>

                        <span className="post-micro-data-super-analytics-item">
                            <img src={this.props.data.liked ? "/static/pictures/icons/like/heart_red.svg" : "/static/pictures/icons/like/heart_gray_shadow.svg"} className="post-general-icon post-like-icon" />
                            {this.props.data.like_count}
                        </span>
                    </div>

                    <hr style={{  width: "60%", margin: "0 28px", height: 2, borderColor: "rgb(234,234,234)" }} />
                </div>
				<div className="post-content">
					{
						thisText
					}
				</div>

                <hr style={{  width: "60%", margin: "1.1em 0", marginBottom: -2, marginLeft: 16 }} />

                <div className="post-comment-wrapper">
                    <Comments post_id={this.props.data.id} data={this.props.comments} />
                </div>

                <PostFooter data={this.props.data} />
			</div>
		);
	}
});

var ReportingForm = React.createClass({
    submitted: false,
    mixins: [ Reflux.listenTo(PostStore,"onPostUpdate") ],

    onPostUpdate: function(postData) {
        if (typeof postData !== 'undefined' && postData.hasOwnProperty('reported')) {
            this.submitted = true;
            var that = this;

            setTimeout(function(){
                that.submitted = false;
            }, 500);

            this.forceUpdate();
        }
    },

    stopProp: function(e){
        e.stopPropagation();
    },

    radioChange: function(e){
        console.log("radio changed", $("input[name=reason]:checked").val());
    },

    report: function(e){
        e.preventDefault();
        var reason = -1;
        switch($("input[name=reason]:checked").val()) {
            case "mature":
                reason = ReportConstants.MATURE;
                break;
            case "uninteresting":
                reason = ReportConstants.UNINTERESTING;
                break;
            case "copyright":
                reason = ReportConstants.COPYRIGHT;
                break;
            case "spam":
                reason = ReportConstants.SPAM;
                break;
        }
        if(reason>-1){
            var text = this.refs.comment.getDOMNode().value.trim();
            WondrousActions.sendReport(PostStore.reportType, PostStore.reportId, reason, text);
        }
    },

    render: function(){
        return (
            <div onClick={this.stopProp}>
                <h1>Reporting Content</h1>
                {this.submitted?<h2>Thank you for your report!</h2>:
                <form onChange={this.radioChange} onSubmit={this.report}>
                  <input type="radio" name="reason" value="mature" />Mature
                  <input type="radio" name="reason" value="uninteresting" />Against my views
                  <input type="radio" name="reason" value="copyright" />Copyright
                  <input type="radio" name="reason" value="spam" />Spam
                  <textarea ref="comment" placeholder="place write any additional comments here"></textarea>
                  <button type="submit">Report</button>
                </form>
                }
            </div>
        );
    }
});

var PostModal = React.createClass({
	mixins:[
        Reflux.listenTo(PostStore,"onPostUpdate"),
        Reflux.listenTo(ModalStore,"onModalChange")
    ],

    onModalChange: function(){
        this.forceUpdate();
    },

	onPostUpdate: function(postData) {
		this.setState(postData);
	},

	getInitialState: function() {
		return UserStore;
	},

	handleClose: function(evt) {
		WondrousActions.closeCardModal();
	},

	stopProp: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	},

	render: function() {
        if (typeof this.state.post === 'undefined') {
            return (<div></div>);
        }


		divStyle = ModalStore.cardOpen ? {display:"block"} : {display:"none"};

		return (
			<div onClick={this.handleClose} className="_dimmer" style={divStyle}>

				<div className="vertical-center-wrapper">
					<div className="vertical-center">

						<div className="modal-wrapper">
                            <div onClick={this.stopProp} className="modal round-5">
                                {PostStore.postError!=null?PostStore.postError:
                                <Post data={this.state.post} comments={this.state.comments}/>}
                            </div>
						</div>

					</div>
				</div>

			</div>
		);
	}
});

var ReportModal = React.createClass({
    mixins:[ Reflux.connect(ModalStore,"data") ],

    getInitialState: function() {
        return { data:{reportType: null} }
    },

    handleClose: function(evt) {
		WondrousActions.toggleCommentReport();
	},

    stopProp: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	},

    render: function() {
		divStyle = this.state.data.reportType!=null? {display:"block"} : {display:"none"};
		return (
			<div onClick={this.handleClose} className="_dimmer" style={divStyle}>

				<div className="vertical-center-wrapper">
					<div className="vertical-center">

						<div className="modal-wrapper">
                            <div onClick={this.stopProp} className="modal round-5">
                                <ReportingForm />
                            </div>
						</div>

					</div>
				</div>

			</div>
		);
	}
});

var SignupModal = React.createClass({
    mixins:[ Reflux.listenTo(ModalStore,"onModalChange") ],

    onModalChange: function() {
        this.forceUpdate();
    },

    handleClose: function(evt) {
        WondrousActions.closeSignupPrompt();
	},

    stopProp: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	},

    render: function() {
		divStyle = ModalStore.signupOpen?{display:"block"} : {display:"none"};
		return (
			<div onClick={this.handleClose} className="_dimmer" style={divStyle}>

				<div className="vertical-center-wrapper">
					<div className="vertical-center">

						<div className="modal-wrapper">
                            <div onClick={this.stopProp} className="modal round-5">
                                <LoggedOut/>
                            </div>
						</div>

					</div>
				</div>

			</div>
		);
	}
});


module.exports = {PostModal:PostModal,ReportModal:ReportModal,SignupModal:SignupModal};
