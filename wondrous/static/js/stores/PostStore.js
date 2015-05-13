var WondrousActions = require('../actions/WondrousActions');
var CommentStore = require('./CommentStore');
var FeedSet = require('../libs/FeedSet');

var PostStore = Reflux.createStore({
    listenables: WondrousActions,

    init: function() {
        this.unloadUser();
        this.listenTo(CommentStore, this.onCommentChange);
    },

    onCommentChange: function(comments){
        this.post.comment_count = comments.comments.length;
        this.trigger(this.getPostState());
    },

    unloadUser: function() {
        this.post = { subject: '', text: '', id: -1 };
        this.userPage = 0;
        this.likedUsers = new FeedSet(null, true, false);
        this.postError = null;
        this.postLink = null;
        this.likedUserPaging = false;
        this.doneLikedUserPaging = false;
        this.loading = false;
        this.moreOptions = false;
    },

    closeCardModal: function() {
        this.postLink = null;
        this.moreOptions = false;
    },

    getPostState: function() {
        return {
            post: this.post,
            moreOptions: this.moreOptions,
            likedUsers: this.likedUsers.sortedSet,
            postLink: this.postLink,
            postError: this.postError
        };
    },

    togglePostLink: function() {
        if (this.postLink === null) {
            this.postLink = "https://"+window.location.host+'/post/'+this.post.id;
        } else {
            this.postLink=null;
        }
        this.trigger(this.getPostState());
    },

    toggleMoreOptions: function() {
        this.moreOptions = !this.moreOptions;
        this.trigger(this.getPostState());
    },

    newPostLoad: function(post_id) {
        this.unloadUser();
        if (typeof post_id !== 'undefined' && !this.loading){
            this.loading = true;
            this.post.id = post_id;
            WondrousActions.openCardModal();
            WondrousActions.loadPost(post_id);
        }
    },


    loadMoreLikedUsers: function() {
        if (typeof this.post.id !=='undefined' && this.post.id != -1 && !this.likedUserPaging && !this.doneLikedUserPaging) {
            this.likedUserPaging = true;
            WondrousActions.loadLikedUsers(this.post.id, this.userPage);
            this.userPage++;
        }
    },

    updatePostOnModal: function(post) {
        if (typeof post !== 'undefined') {
            this.post = post;
        }
        this.trigger(this.getPostState());
    },

    updatePost: function(postData) {
        this.post = postData;
        WondrousActions.updatePostOnWall();
        WondrousActions.updatePostOnFeed();
        this.loading = true;
        this.trigger(this.getPostState());
    },

    loadPostError: function(err) {
        this.loading = false;
        this.postError = err.error;
        this.trigger(this.getPostState());
    },

    updateLikedUsers: function(users) {
        this.likedUserPaging = false;
        if (users.length < 15) {
            this.doneLikedUserPaging = true;
        }

        users.map(function(user, index) {
            this.push(user);
        }, this.likedUsers);
        this.trigger(this.getPostState());
    }

});

module.exports = PostStore;
