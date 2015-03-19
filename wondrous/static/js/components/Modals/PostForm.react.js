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

var PostForm = React.createClass({
    mixins: [Reflux.listenTo(UploadStore, "onUploadChange")],
    file: null,

    getInitialState: function() {
        return {percent: 0, error: null, isCover: true};
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
            $('#postUploadBtn').hide();
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
        var isPictureModal = (ModalStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

        if (!isPictureModal) {
            WondrousActions.togglePostModal();
        } else {
            WondrousActions.togglePictureModal();
        }

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
        $('#postUploadBtn').show();

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
        var isPictureModal = (ModalStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

        if (isPictureModal) {
            setTimeout(this.updateProfile, 500);
        } else {
            setTimeout(this.addToFeeds, 500);
        }

    },

    handleSubmit:function(e){
        var isPictureModal = (ModalStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

        if (isPictureModal) {
            if (typeof this.file !=='undefined' && this.file != null){
                // var dataURL = $(this.refs.cropBox.getDOMNode()).data('cropbox').getBlob();
                var dataURL = uri2blob($('#cropBox').cropper("getCroppedCanvas").toDataURL());
                WondrousActions.addProfilePicture(this.file, dataURL);
            }
        } else {
            var postSubject = $('#postSubject').val();
            var postText    = $('#postTextarea').val();

            var dataURL = null;
            if (typeof(this.file) !== 'undefined' && this.file) {
                // dataURL = $(this.refs.cropBox.getDOMNode()).data('cropbox').getBlob();
                dataURL = uri2blob($('#cropBox').cropper("getCroppedCanvas").toDataURL());
                console.log("URL:", dataURL);
            }
            WondrousActions.addNewPost(postSubject, postText, this.file, dataURL);
        }
    },

    toggleBackgroundDisplay: function() {
        this.setState({
            isCover: !this.state.isCover
        });
        this.forceUpdate();
    },

    handleCrop: function(e) {
        $(this.refs.cropBox.getDOMNode()).attr('src', e.target.result);

        var canvasData = {
            "left": -462.2145922746779,
            "top": -109.99570815450636,
            "width": 750,
            "height": 390,
        };

        var cropBoxData = {
            "left": 0,
            "top": 0,
            "width": 750,
            "height": 390,
        };

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
            },

            crop: function(data) {
            // Output the result data for cropping image.
            }
        });


    },

    render: function() {
        var isPictureModal = (ModalStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

        var divStyle = {
            display: isPictureModal ? "none" : "block",
            backgroundColor : "rgb(255,255,255)"
        };
        // onDrop={this.handleDrop} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver}
        return (
            <div id="new-post-dialogue" ref="postform" className="new-post-wrapper round-3" style={{ width: 780 }}>
                <div id="crop-box-wrapper">
                    <img id="cropBox" ref="cropBox" style={{ width: 750 }} src="/static/pictures/transparent.gif" />
                </div>

                <div className="new-post-progress-bar">
                    <div className="new-post-progress-bar--juice" style={{ width: this.state.percent * 8 }}></div>
                </div>

                {/* {this.state.error ? <span>{this.state.error}% uploaded</span> : null} */}

                {/*<div>
                    <div onClick={this.toggleBackgroundDisplay} className={!this.state.isCover  ? "post-form-bg-display-option" : "post-form-bg-display-option post-form-bg-display-option--active"}>Cover</div>
                    <div onClick={this.toggleBackgroundDisplay} className={this.state.isCover ? "post-form-bg-display-option" : "post-form-bg-display-option post-form-bg-display-option--active"}>Fit-to-screen</div>
                </div>*/}

                <div className="new-post-element" style={divStyle}>
                    <div style={{ position: "relative", margin: "0 auto", marginBottom : -1 }}>
                        <input id="postSubject" className="new-post-subject" maxLength="45" placeholder="Add a title!" spellCheck="False"/>
                    </div>
                </div>

                <div className="new-post-element" style={divStyle}>
                    <div className="post-input-wrapper">
                        <div className="highlighter"></div>
                        <div className="typehead">
                            <textarea id="postTextarea" onChange={this.onTextAreaChange} ref="postTextArea" maxLength="5000" placeholder="Write something. Post a link. Add #hashtags." className="post-input"
                            style={{ overflow: "y-scroll", wordWrap: "break-word", resize: "none", height: 48 }}></textarea>
                        </div>
                    </div>
                </div>

                <div id="post-hashtags"></div>
                <div id="postUploadBtn" className="upload-button fileinput-button">
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

                <div onClick={this.handleSubmit} id="post-button" role="button" className="post-button round-3">{isPictureModal?"Upload":"Share"}</div>
                <div onClick={this.handleCancel} role="button" className="post-button round-3 cancel-post-button">Cancel</div>
            </div>
        );
    },
    onTextAreaChange: function(){
        var text = this.refs.postTextArea.getDOMNode().value;

        var mentions = text.match(/\s*@\s*(\w+)/g);
        var hashtags = text.match(/\s*#\s*(\w+)/g);

    },
    componentDidMount: function () {
        var isPictureModal = (ModalStore.modalType == WondrousConstants.MODALTYPE_PICTURE);
        if(!isPictureModal){

        }
    }
});

module.exports = PostForm;
