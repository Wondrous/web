var WondrousAPI = require('../../utils/WondrousAPI');
var WondrousActions = require('../../actions/WondrousActions');
var WondrousConstants = require('../../constants/WondrousConstants');
var ModalStore = require('../../stores/ModalStore');
var UploadStore = require('../../stores/UploadStore');

function uri2blob(dataURI) {
    var uriComponents = dataURI.split(',');
    var byteString = atob(uriComponents[1]);
    var mimeString = uriComponents[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mimeString });
}

var PictureForm = React.createClass({
    mixins: [Reflux.listenTo(UploadStore, "onUploadChange")],
    file: null,
    height: 0,
    width: 0,

    getInitialState: function() {
        return {
            loaded:false,
            percent: 0,
            error: null,
            isCover: true,
            imgHeight: null,
            imgWidth: null,
        };
    },

    onUploadChange: function(msg){
        if (msg.hasOwnProperty('error')) {
            this.setState({error: msg.error});
        } else if (msg.hasOwnProperty('percent')) {

            this.setState({percent: msg.percent});

        } else if (msg.hasOwnProperty('completed')) {
            this.handleCancel();
            this.state.percent = 0;
        }
    },

    readURL: function() {
        if (this.file) {
            $('#pictureUploadBtn').hide();
            var reader = new FileReader();
            reader.onload = this.handleCrop;
            reader.readAsDataURL(this.file);
        }
    },

    handleDrop: function(e){
        e.preventDefault();
        this.setState({
          isDragActive: false
        });

        var files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }

        this.file = files[0];
        this.readURL();
    },

    onDragLeave: function(e) {
        this.setState({
          isDragActive: false
        });
    },

    onDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";

        this.setState({
          isDragActive: true
        });
    },

    handleCancel: function(e){
        this.loaded = false;
        WondrousActions.togglePictureModal();

        // Fade out the post form
        $('#cropBox').cropper('destroy');
        $('#cropBox').attr('src', "/static/pictures/transparent.gif");

        if(this.file){
            this.file = null;
            $('#cropBox').cropper('destroy');
        }

        // Clear the post textarea and the hashtag highlighter
        $(".highlighter").empty();
        $("#postTextarea").val('');
        $("#postSubject").val('');

        // Reset any post error messages
        $(".post-error").empty();
        $('.post-error-wrapper').hide();

        // Remove anything that pertains to file uploads
        $('.objectFileID').empty();

        $('.post-dialogue-progress').hide();
        $('#pictureUploadBtn').show();

        // Remove hashtags and the hashtag preview
        $('.hashtag').val('');
        $('#post-hashtags').empty();
    },

    onProgress: function(percentage) {
        console.log("upload percentage", percentage);
    },

    onFileUploadComplete: function(err, res) {
        if (err == null) {
            console.log("file uploaded!", res);
        } else {
            console.error("upload file error", err);
        }
        this.handleCancel(null);
        setTimeout(this.updateProfile, 500);


    },

    handleSubmit:function(e){
        this.loaded = false;

        if (typeof this.file !=='undefined' && this.file != null){
            var dataURL = uri2blob($('#cropBox').cropper("getCroppedCanvas").toDataURL());
            WondrousActions.addProfilePicture(this.file, dataURL);
        }

    },

    handleCrop: function(e) {
        var tempImg = new Image();
        tempImg.src = e.target.result;
        this.width = tempImg.width;
        this.height = tempImg.height;

        // $(this.refs.cropBox.getDOMNode()).attr('src', e.target.result);

        var canvasData = {
            "width": 400,
            "height": 400,
        };

        var cropBoxData = {
            "left": 0,
            "top": 0,
            "width": 400,
            "height": 400,
        };

        var that = this;

        $('#cropBox').cropper({
            aspectRatio: "free",
            strict: true,
            dragCrop: false,
            movable: false,
            resizable: false,
            zoomable: false,

            built: function() {
              $('#cropBox').cropper('setCanvasData', canvasData);
              $('#cropBox').cropper('setCropBoxData', cropBoxData);
              that.loaded = true;
            },

            crop: function(data) {
            // Output the result data for cropping image.

            }
        });
    },

    render: function() {
        // onDrop={this.handleDrop} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver}
        return (
            <div id="new-post-dialogue" ref="postform" className="new-post-wrapper round-3" style={{ width: 430 }}>
                <div id="crop-box-wrapper picture-wrapper">
                    <img id="cropBox" ref="cropBox" style={{ width: 400 }} src="/static/pictures/transparent.gif" />
                </div>

                <div className="new-post-progress-bar">
                    <div className="new-post-progress-bar--juice" style={{ width: this.state.percent * 8 }}></div>
                </div>


                <div id="post-hashtags"></div>
                <div id="pictureUploadBtn" className="upload-button fileinput-button upload-photo">
                    Upload a photo
                    <div className="upload-photo-icon">
                        I
                    </div>
                    <input id="fileuploadPostImage" onChange={this.handleDrop} type="file" name="files[]"/>
                </div>

                <div id="progress" className="small-red-bar fileinput-button progress post-dialogue-progress">
                    <div className="progress-bar progress-bar-success" style={{"textAlign": "center"}}></div>
                </div>

                <div id="post-upload-file"  className="files" style={{ postion: "relative", marginLeft: 5, fontSize: 14 }}></div>

                <div className="post-error-wrapper">
                    <span className="post-error"></span>
                </div>

                <div onClick={this.handleSubmit} id="post-button" role="button" className="post-button round-3">Share</div>
                <div onClick={this.handleCancel} role="button" className="post-button round-3 cancel-post-button">Cancel</div>
            </div>
        );
    }
});

module.exports = PictureForm;
