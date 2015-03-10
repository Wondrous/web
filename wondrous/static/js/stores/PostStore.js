var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var Set = require("collections/set");

var defaultUser = {username:''};

var getNewSet = function(arr){
    return new Set(arr, function(a,b){
        return a.id==b.id;
    }, function(obj){
        return String(obj.id);
    });
}

var PostStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.unloadUser();
        this.listenTo(UserStore,"onUserChange");
    },
    unloadUser: function(){
        this.post = {subject:'',text:'',id:-1};
        this.commentPage = 0;
        this.comments = getNewSet(null);
        this.paging = false;
        this.donePaging = false;
    },
    newPostLoad: function(post_id){
        this.unloadUser();
        if (typeof post_id !=='undefined'){
            WondrousActions.updateComments(post_id,this.commentPage);
            this.incrementCommentPage();
        }
    },

    loadMoreComments: function(){
        if (typeof this.post.id !=='undefined' && !this.paging && !this.donePaging){
            this.paging = true;
            WondrousActions.updateComments(this.post.id,this.commentPage);
            this.incrementCommentPage();
        }
    },

    incrementCommentPage: function(){
        this.commentPage++;
    },

    openCardModal: function(){
        if (this.modalOpen!=true){
            this.modalOpen=true;
            this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
            $('body').addClass('modal-open');
        }
    },

    closeCardModal: function(){
        if (this.modalOpen!=false){
            this.modalOpen=false;
            this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
            $('body').removeClass('modal-open');
        }
    },

    onUserChange: function(userData){

    },

    updatePost: function(postData){
        this.post = postData;
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
    },

    addToComments: function(comment){
        if(this.post.id == comment.post_id){
            this.comments.add(comment);
            this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
        }
    },

    loadComments: function(comments) {
        this.paging = false;
        if (comments.length < 10) {
            this.donePaging = true;
        }

        comments.reverse();
        var temp = getNewSet(comments);
        console.log("starting up with", this.comments.length);

        this.comments.map(function(com,index){
            temp.add(com);
        },temp);
        this.comments = temp;
        console.log("ending up with", temp.length);

        this.trigger({modalOpen: this.modalOpen, post: this.post, comments: this.comments});
    },

    removeFromComment: function(comment_id){
        var placeholder = {id:comment_id}
        this.comments.deleteAll(placeholder);
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
    }
});


module.exports = PostStore;
