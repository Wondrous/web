var WondrousActions = require('../actions/WondrousActions');
var FeedSet = require('../libs/FeedSet');

var CommentStore = Reflux.createStore({
    listenables: WondrousActions,

    init: function() {
        this.unloadUser();
    },

    unloadUser: function() {
        this.post_id = null;
        this.commentPage = 0;

        this.comments = new FeedSet(null, true);

        this.commentPaging = false;
        this.doneCommentPaging = false;
    },

    newPostLoad: function(post_id) {
        this.unloadUser();
        if (typeof post_id !== 'undefined' && !this.commentPaging){
            this.post_id = post_id;
            this.loadMoreComments();
        }
    },

    loadMoreComments: function() {
        if (this.post_id !=null && !this.commentPaging && !this.doneCommentPaging) {
            this.commentPaging = true;
            WondrousActions.loadComments(this.post_id, this.commentPage);
            console.log("loading comments", this.post_id, this.commentPage);
            this.commentPage++;
        }
    },

    loadCommentsError: function(err) {
        this.commentPaging = false;
        this.trigger({ comments: this.comments.sortedSet });
    },

    commentError: function(err) {

    },

    updatePostOnModal: function(post) {
        if (typeof post !== 'undefined') {
            this.post = post;
        }
        this.trigger({ comments: this.comments.sortedSet });
    },

    updateComment: function(comment){
        console.log(comment);
        this.comments.update(comment);
        this.trigger({ comments: this.comments.sortedSet });
    },

    addToComments: function(comment) {
        if(this.post_id == comment.post_id) {
            this.comments.push(comment);
            this.post.comment_count++;
            WondrousActions.updatePostOnWall();
            WondrousActions.updatePostOnFeed();
            this.trigger({ comments: this.comments.sortedSet });
        }
    },

    updateComments: function(comments) {
        this.commentPaging = false;
        if (comments.length < 10) {
            this.doneCommentPaging = true;
        }

        comments.map(function(comment,index) {
            this.push(comment);
        }, this.comments);
        this.post.comment_count = this.comments.sortedSet.length;
        WondrousActions.updatePostOnWall();
        WondrousActions.updatePostOnFeed();
        this.trigger({ comments: this.comments.sortedSet });
    },

    removeFromComment: function(comment_id) {
        this.comments.delete(comment_id);
        this.trigger({ comments: this.comments.sortedSet });
    }

});

module.exports = CommentStore;
