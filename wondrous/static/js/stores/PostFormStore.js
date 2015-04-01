var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var WondrousAPI = require('../utils/WondrousAPI');
var URLGenerator = require('../utils/URLGenerator');
var EXIF = require('exif-js');

var defaultUser = {username:''};

var rotateDataURL = function (image, x, y, angle) {
    var canvas = document.createElement("canvas");
    canvas.height = image.height;
    canvas.width = image.width;

    var addon= 0;

    if (angle==90||angle==270){
        if (canvas.width>canvas.height){
            addon = (canvas.width-canvas.height)/2;
            canvas.height = image.width;
            canvas.width = image.height;
        }
    }

    var context = canvas.getContext("2d");
	// save the current co-ordinate system
	// before we screw with it
	context.save();

	// move to the middle of where we want to draw our image
	context.translate(x, y);

	// rotate around that point, converting our
	// angle from degrees to radians
	context.rotate(angle * Math.PI/180);



    console.log("adding",addon,-(image.width/2)+addon);
	// draw it up and to the left by half the width
	// and height of the image
	context.drawImage(image, -(image.width/2)+addon, -(image.height/2)+addon);

	// and restore the co-ords to how they were when we began
	context.restore();
    context.fill();

    return canvas.toDataURL();
}

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
        var that = this;

        tempImg.onload = function(){
            EXIF.getData(that.file, function() {
                var orientation = this.exifdata.Orientation || 0;

                that.width = tempImg.width;
                that.height = tempImg.height;
                console.log("orientation is",this.exifdata,orientation);
                switch(orientation){
                   case 8:
                       that.dataURL = rotateDataURL(tempImg,tempImg.width/2,tempImg.height/2,90);
                       break;
                   case 3:
                       that.dataURL = rotateDataURL(tempImg,tempImg.width/2,tempImg.height/2,180);
                       break;
                   case 6:
                       that.dataURL = rotateDataURL(tempImg,tempImg.width/2,tempImg.height/2,90);
                       break;
                }

                that.loaded = true;

                that.trigger({dataURL:that.dataURL});
            });
        }
        tempImg.src = this.dataURL = e.target.result;



    },

    toggleBackgroundDisplay: function() {
        this.isCover = !this.isCover;
        this.trigger({isCover:this.isCover});
    }
});

module.exports = PostFormStore;
