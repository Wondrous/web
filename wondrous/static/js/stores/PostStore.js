var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var FeedSet = require('../libs/FeedSet');

var defaultUser = {username:''};

var PostStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.unloadUser();
        this.listenTo(UserStore,"onUserChange");
    },

    unloadUser: function(){
        this.post = {subject:'',text:'',id:-1};
        this.commentPage = 0;
        this.comments = new FeedSet(null,true);
        this.postError = null;
        this.paging = false;
        this.donePaging = false;
        this.loading = false;
        this.reportType = null;
        this.reportId = null;

        this.postLink = null;
    },

    closeCardModal: function(){
        this.postLink = null;
    },
    togglePostLink: function(){
        if(this.postLink==null){
            this.postLink = "https://"+window.location.host+'/post/'+this.post.id;
        }else{
            this.postLink=null;
        }
        this.trigger();
    },
    newPostLoad: function(post_id){
        this.unloadUser();
        if (typeof post_id !=='undefined'&&!this.loading){
            this.loading = true;

            this.post.id = post_id;
            WondrousActions.openCardModal();
            WondrousActions.loadPost(post_id);
            this.loadMoreComments();
        }
    },

    loadMoreComments: function(){
        if (typeof this.post.id !=='undefined' &&this.post.id>0&& !this.paging && !this.donePaging){
            this.paging = true;
            WondrousActions.loadComments(this.post.id,this.commentPage);
            console.log("loading comments",this.post.id,this.commentPage);
            this.incrementCommentPage();
        }
    },
    reportSubmitted: function(){
        this.trigger({post:this.post,comments:this.comments.sortedSet,reported:true});
    },
    loadCommentsError: function(err){
        this.paging = false;
        this.trigger();
    },

    commentError: function(err){

    },

    incrementCommentPage: function(){
        this.commentPage++;
    },


    onUserChange: function(userData){

    },

    updatePost: function(postData){
        this.post = postData;
        WondrousActions.updatePostOnWall();
        WondrousActions.updatePostOnFeed();
        this.loading = true;
        this.trigger({post:this.post,comments:this.comments.sortedSet});
    },

    loadPostError: function(err){
        this.comments.reset();
        this.loading = false;
        this.paging = false;
        this.postError = err.error;
        this.trigger({post:this.post,comments:this.comments.sortedSet});
    },

    addToComments: function(comment){
        if(this.post.id == comment.post_id){
            this.comments.push(comment);
            this.post.comment_count++;
            WondrousActions.updatePostOnWall();
            WondrousActions.updatePostOnFeed();
            this.trigger({post:this.post,comments:this.comments.sortedSet});
        }
    },

    updateComments: function(comments) {
        this.paging = false;
        if (comments.length < 10) {
            this.donePaging = true;
        }

        comments.map(function(comment,index){
            this.push(comment);
        }, this.comments);
        this.post.comment_count=this.comments.sortedSet.length;
        WondrousActions.updatePostOnWall();
        WondrousActions.updatePostOnFeed();
        this.trigger({post: this.post, comments: this.comments.sortedSet});
    },

    removeFromComment: function(comment_id){
        this.comments.delete(comment_id);
        this.trigger({post:this.post,comments:this.comments.sortedSet});
    }

});


module.exports = PostStore;
