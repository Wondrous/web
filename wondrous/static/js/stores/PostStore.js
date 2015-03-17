var WondrousActions = require('../actions/WondrousActions');
var PostStore = require('../stores/PostStore');
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
        this.paging = false;
        this.donePaging = false;
        this.loading = false;
        this.reportType = null;
        this.reportId = null;
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

    toggleCommentReport: function(item_id){
        if(this.reportType==null){
            this.reportType = "comment";
            this.reportId = item_id;
            $('body').addClass('modal-open');
        }else{
            this.reportType = null;
            $('body').removeClass('modal-open');
        }
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments.sortedSet});
    },

    togglePostReport: function(item_id){
        if(this.reportType==null){
            this.reportType = "post";
            this.reportId = item_id;
            $('body').addClass('modal-open');
        }else{
            this.reportType = null;
            $('body').removeClass('modal-open');
        }
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments.sortedSet});
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
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments.sortedSet,reported:true});
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

    openCardModal: function(){
        if (this.modalOpen!=true){
            this.modalOpen=true;
            this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments.sortedSet});
            $('body').addClass('modal-open');
        }
    },

    closeCardModal: function(){
        if (this.modalOpen!=false){
            this.modalOpen=false;
            this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments.sortedSet});
            $('body').removeClass('modal-open');
        }
    },

    onUserChange: function(userData){

    },

    updatePost: function(postData){
        this.post = postData;
        WondrousActions.updatePostOnWall();
        WondrousActions.updatePostOnFeed();
        this.loading = true;
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments.sortedSet});
    },

    loadPostError: function(err){
        this.comments.reset();
        this.loading = false;
        this.paging = false;
    },

    addToComments: function(comment){
        if(this.post.id == comment.post_id){
            this.comments.push(comment);
            this.post.comment_count++;
            WondrousActions.updatePostOnWall();
            WondrousActions.updatePostOnFeed();
            this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments.sortedSet});
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
        this.trigger({modalOpen: this.modalOpen, post: this.post, comments: this.comments.sortedSet});
    },

    removeFromComment: function(comment_id){
        this.comments.delete(comment_id);
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments.sortedSet});
    }

});


module.exports = PostStore;
