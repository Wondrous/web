var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var Post = require('./Post.react');
var PostStore = require('../stores/PostStore');
var UserStore = require('../stores/UserStore');
var Link = Router.Link;

var UserTitle = React.createClass({
    repost: null,
    mixins: [Router.Navigation],

    handleClick: function(evt) {
        if (typeof this.props.data.username != 'undefined') {

            WondrousActions.closeCardModal();
            // this.transitionTo('/' + this.props.data.username);
        }
    },

    handleClickOnOwner: function(evt) {
        if (typeof this.repost.username != 'undefined') {
            WondrousActions.closeCardModal();
            // this.transitionTo('/' + this.repost.username);
        }
    },

    render: function() {
        this.repost = null;
        if(typeof this.props.data === 'undefined'){
            return (<div></div>);
        }
        var name = this.props.data.name;
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
                    <Link to={hrefPlaceholder} onClick={this.handleClick}>{name}</Link>
                    {this.repost ? <img src="/static/pictures/icons/repost/repost_gray_shadow.svg" className="post-general-icon" style={{height: 22, width: 22, top: 7}} /> : null}
                    {this.repost ? <Link className="recipient" to={hrefRepostPlaceholder} onClick={this.handleClickOnOwner}>{this.repost.name}</Link> : null}
                </span>
            </div>
            );
    }
});

var Comment = React.createClass({
    mixins: [Router.Navigation],

    handleClick: function(evt) {
        evt.preventDefault();
        if (typeof this.props.data.username != 'undefined') {
            WondrousActions.closeCardModal();
            this.transitionTo('/' + this.props.data.username);
        }
    },

    onDelete: function(){
        WondrousActions.deleteComment(this.props.data.id);
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

        return (
            <div className="post-comment">
                <div className="post-comment-image-wrapper round-2">
                    <img className="post-comment-img round-2" src={img_src} />
                </div>
                <div className="post-comment-content">
                    <a onClick={this.handleClick} className="post-comment-un">
                        {this.props.data.name}
                        <span style={{ fontWeight: 100 }}> (@{this.props.data.username})</span>
                    </a>
                    <span>{this.props.data.text}</span>

                    <div className="post-comment-date">{createdAtDisplay}</div>

                    {is_it_mine ?
                    	<div className="post-comment-delete-btn" onClick={this.onDelete}>X</div>
                    	: null}
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
                {!PostStore.donePaging ? <button className="post-comment-load-more" onClick={this.loadMoreComments}>Load more comments</button> : null}
                {comments}
                {comments.length == 0 ? <div className="post-no-comments">Be the first to share your thoughts!</div> : null}
                <form style={{ marginLeft: 28, marginRight: 10 }} >
                    <textarea className="comment-textarea" ref="commentBox" placeholder="Share your thoughts!"></textarea>
                    <input className="post-comment-btn" type="submit" value="Share" onClick={this.onComment}/>
                </form>
            </div>);
    }
});

var Photo = React.createClass({

	handleClose: function(evt){
		WondrousActions.closeCardModal();
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

            </div>);
    },
    componentDidMount: function() {
        // Nothing much happening here!!!
    }
});

var PostFooter = React.createClass({

    deletePost: function() {
        WondrousActions.closeCardModal();
        WondrousActions.deletePost(this.props.data.id);
    },

    likePost: function() {
        this.props.data.liked = !this.props.data.liked;
        this.forceUpdate();
        WondrousAPI.toggleLike({
            post_id: this.props.data.id,
            callback: null,
        });
    },
    clickRepost: function() {
        WondrousActions.repost(this.props.data.id) ;
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
		if (typeof this.props.data ==='undefined'){
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

		var thisText = this.props.data.text.split('\n');
		return (
			<div ref="post"  className="post-body round-3" >
				<div style={{ backgroundColor: "#FFFFFF", position: "relative" }}>
					<UserTitle data={this.props.data} />
				</div>
				<div className="post-title post-title-big" style={{ marginLeft: 28, marginRight: 28 }}>{this.props.data.subject}</div>
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
				<div className="post-content" >
						{
							thisText.map(function(textChunk, idx) {
								if (idx == thisText.length - 1) {
									return textChunk;
								} else {
									return (
										<span>{textChunk}<br /></span>
									);
								}
							})
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

var PostModal = React.createClass({
	mixins:[Reflux.listenTo(PostStore,"onPostUpdate")],

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
        if (typeof this.state.post === 'undefined'){
            return (<div></div>);
        }
		divStyle = this.state.modalOpen ? {display:"block"} : {display:"none"};

		return (
			<div onClick={this.handleClose} className="_dimmer" style={divStyle}>

				<div className="vertical-center-wrapper">
					<div className="vertical-center">

						<div className="modal-wrapper">
							<div onClick={this.stopProp} className="modal round-5">
								<Post data={this.state.post} comments={this.state.comments}/>
							</div>
						</div>

					</div>
				</div>

			</div>
		);
	}
});

module.exports = PostModal;
