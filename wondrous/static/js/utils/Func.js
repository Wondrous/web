var UserStore = require('../stores/UserStore');
var WondrousActions = require('../actions/WondrousActions');

module.exports = {
    checkLogin:function(){
        if(!UserStore.loggedIn){
            WondrousActions.openSignupPrompt();
            return false;
        }
        return true;
    },

    uri2blob: function (dataURI) {
        var uriComponents = dataURI.split(',');
        var byteString = atob(uriComponents[1]);
        var mimeString = uriComponents[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++)
            ia[i] = byteString.charCodeAt(i);
        return new Blob([ab], { type: mimeString });
    },

    buildCropper:function (DOMN,isPost){
        $(DOMN).cropper("destroy");
        var canvasData = {
            "left": -462.2145922746779,
            "top": -109.99570815450636,
            "width": isPost==true?750:400,
            "height": isPost==true?390:400,
        };

        var cropBoxData = {
            "left": 0,
            "top": 0,
            "width": isPost==true?750:400,
            "height": isPost==true?390:400,
        };

        $(DOMN).cropper({
            aspectRatio: "free",
            strict: true,
            dragCrop: false,
            movable: false,
            resizable: false,
            zoomable: false,

            built: function() {
                $(DOMN).cropper('setCanvasData', canvasData);
                $(DOMN).cropper('setCropBoxData', cropBoxData);
            },

            crop: function(data) {
            // Output the result data for cropping image.

            }
        });
    },

    dateToString: function(raw){
        var createdAt = moment(raw).local();
        var mmtMidnight = moment().startOf('day');
        var createdAtDisplay = "";

        if (createdAt.isBefore(mmtMidnight)) {
            var mmtYear = moment().startOf('year');
            if (createdAt.isBefore(mmtYear)) {
                createdAtDisplay = createdAt.format("h:mma, MMM Do 'GG");
            } else {
                createdAtDisplay = createdAt.format("h:mma, MMM Do");
            }
        } else {
            createdAtDisplay = createdAt.format("h:mma");
        }

        return createdAtDisplay;
    }

}
