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
        this.newPostLoad();

        this.listenTo(UserStore,"onUserChange");
    },

    newPostLoad: function(post_id){
        this.post = {subject:'',text:'',id:-1};
        this.commentPage = 0;
        this.comments = getNewSet(null);
        this.modalOpen = false;

        if (typeof post_id !=='undefined'){
            WondrousActions.updateComments(post_id,this.commentPage);
            this.incrementCommentPage();
        }
    },

    incrementCommentPage: function(){
        this.commentPage++;
    },

    toggleCardModal: function(post_id){
        this.modalOpen=!this.modalOpen;
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
    },

    onUserChange: function(userData){

    },

    updatePost: function(postData){
        this.post = postData;
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
    },

    addToComments: function(comment){
        this.comments.add(comment);
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
    },

    loadComments: function(comments){
        comments.map(function(comment,index){
            this.add(comment);
        },this.comments);

        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
    },

    removeFromComment: function(comment_id){
        var placeholder = {id:comment_id}
        this.comments.deleteAll(placeholder);
        this.trigger({modalOpen:this.modalOpen,post:this.post,comments:this.comments});
    }
});


module.exports = PostStore;
