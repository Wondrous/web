var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var WondrousAPI = require('../utils/WondrousAPI');
var URLGenerator = require('../utils/URLGenerator');
var EXIF = require('exif-js');

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

    uploadComplete: function(){
        this.unloadUser();
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
        var that = this;

        EXIF.getData(this.file, function() {
            var orientation = this.exifdata.Orientation || 0;
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");

            that.width = canvas.width = tempImg.width;
            that.height = canvas.height = tempImg.height;

            switch(orientation){
               case 8:
                   ctx.rotate(90*Math.PI/180);
                   ctx.drawImage(tempImg,0,0,tempImg.width,tempImg.height);
                   that.dataURL = canvas.toDataURL();
                   break;
               case 3:
                   /// translate so rotation happens at center of image
                    ctx.translate(tempImg.width * 0.5, tempImg.height * 0.5);

                    /// rotate canvas context
                    ctx.rotate(Math.PI); /// 90deg clock-wise

                    /// translate back so next draw op happens in upper left corner
                    ctx.translate(-tempImg.width * 0.5, -tempImg.height * 0.5);

                   ctx.drawImage(tempImg,0,0,tempImg.width,tempImg.height);
                   that.dataURL = canvas.toDataURL();
                   break;
               case 6:
                   ctx.rotate(-90*Math.PI/180);
                   ctx.drawImage(tempImg,0,0,tempImg.width,tempImg.height);
                   that.dataURL = canvas.toDataURL();
                   break;
            }

            that.loaded = true;
            that.trigger({dataURL:that.dataURL});
        });

    },

    toggleBackgroundDisplay: function() {
        this.isCover = !this.isCover;
        this.trigger({isCover:this.isCover});
    }
});

module.exports = PostFormStore;
