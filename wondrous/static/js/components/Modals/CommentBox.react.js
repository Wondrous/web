var WondrousActions = require('../../actions/WondrousActions');
var PostStore = require('../../stores/PostStore');
var UserStore = require('../../stores/UserStore');
var checkLogin = require('../../utils/Func').checkLogin;
var linkify = require('../../utils/Linkify');
var URLGenerator = require('../../utils/URLGenerator');

var dateToString = require('../../utils/Func').dateToString;

var Comment = React.createClass({
    getInitialState: function(){
        return {editting:false}
    },
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

    onEdit: function(evt){
        this.setState({editting:true})
    },

    render: function() {
        var img_src = (typeof this.props.data.ouuid !== 'undefined') ? URLGenerator.generate75(this.props.data.ouuid): "/static/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = "/" + this.props.data.username;
        var is_it_mine = (this.props.data.user_id == UserStore.user.id);

        var createdAtDisplay = dateToString(this.props.data.created_at);


        var textLinked = linkify(this.props.data.text, "hashtagify--small");
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
                    <button onEdit={this.onEdit}>EDIT</button>
                    <div className="post-comment-date">{createdAtDisplay}</div>

                    {is_it_mine || PostStore.post.user_id==UserStore.user.id ?
                    	<div className="post-comment-delete-btn" onClick={this.onDelete}>X</div>
                    	:
                        <div className="post-comment-delete-btn" onClick={this.reportComment}>f</div>
                    }
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

var CommentBox = React.createClass({
    onComment: function(evt) {
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
            this.refs.commentBox.getDOMNode().placeholder = 'Nothing to say?';
        }
    },

    loadMoreComments: function() {
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
                {!PostStore.doneCommentPaging && comments.length > 0 ?
                    <button className="post-comment-load-more" onClick={this.loadMoreComments}>
                        Load more comments
                    </button>
                    : null}

                {comments}

                {comments.length == 0 ?
                    <div className="post-no-comments">
                        Be the first to share your thoughts!
                    </div>
                    : null}

                <form style={{ margin: "0 28px" }} >
                    <textarea className="comment-textarea" ref="commentBox" placeholder="Share your thoughts!"></textarea>
                    <input className="post-comment-btn" type="submit" value="Share" onClick={this.onComment}/>
                </form>
            </div>);
    }
});

module.exports = CommentBox;
