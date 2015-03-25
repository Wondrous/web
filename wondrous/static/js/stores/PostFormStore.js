var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var WondrousAPI = require('../utils/WondrousAPI');
var URLGenerator = require('../utils/URLGenerator');

var defaultUser = {username:''};

var PostFormStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.unloadUser();
    },

    unloadUser: function(){
        this.loaded = false;
        this.percent = 0;
        this.subject = '';
        this.text = '';
        this.isCover = true;
        this.url = null;
        this.mime_type = null;
        this.file = null;
        this.dataURL = null;
        this.error = null;
        this.height = 0;
        this.width = 0;
        this.post_id = null;
    },

    useUrl: function(url){
        this.url = url;
        this.trigger({url:this.url});
    },

    editPost: function(post,imgDOM){
        this.subject = post.subject;
        this.text = post.text;
        this.isCover = post.isCover;
        this.mime_type = post.mime_type;
        this.post_id = post.id;

        this.url = URLGenerator.generateMedium(post.ouuid);
        this.trigger({url:this.url});
    },

    loadFile: function(file){
        this.file = file;
        var reader = new FileReader();
        reader.onload = this.onLoaded
        reader.readAsDataURL(this.file);
    },

    onLoaded: function(e){
        var tempImg = new Image();
        tempImg.src = this.dataURL = e.target.result;
        this.width = tempImg.width;
        this.height = tempImg.height;
        this.loaded = true;
        this.trigger({dataURL:this.dataURL});
    },

    toggleBackgroundDisplay: function() {
        // console.log(this.isCover);
        this.isCover = !this.isCover;
        this.trigger({isCover:this.isCover});
        // console.log(this.isCover);
    },

    uploadComplete: function(status){
        this.percent = 0;
        this.trigger({completed:status});
    },

    uploadProgress: function(percent){
        this.percent = percent;
        this.trigger({percent:percent});
    },

    uploadError: function(error){
        this.trigger({error:error});
    }

});

module.exports = PostFormStore;
