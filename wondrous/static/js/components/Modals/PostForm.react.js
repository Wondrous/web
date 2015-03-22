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
    height: 0,
    width: 0,

    getInitialState: function() {
        return {
            loaded:false,
            percent: 0,
            error: null,
            isCover: true,
        };
    },

    onUploadChange: function(msg){
        if(ModalStore.postFormOpen){
            if (msg.hasOwnProperty('error')) {
                this.setState({error: msg.error});
            } else if (msg.hasOwnProperty('percent')) {

                this.setState({percent: msg.percent});

            } else if (msg.hasOwnProperty('completed')) {
                this.handlePostCancel();
                this.state.percent = 0;
            }
        }
    },

    readURL: function() {
        if (this.file) {
            $('#postUploadBtn').hide();
            var reader = new FileReader();
            reader.onload = this.handleCrop;
            reader.readAsDataURL(this.file);
        }

        if (this.state.isCover) {
            $("div.cropper-container").removeClass("cropper-hidden");
        } else {
            $("div.cropper-container").addClass("cropper-hidden");
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

    handlePostCancel: function(e){
        this.loaded = false;
        this.props.handleClose(e);

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
        this.handlePostCancel(null);
        setTimeout(this.addToFeeds, 500);
    },

    handleSubmit:function(e){
        this.loaded = false;
        var postSubject = $('#postSubject').val();
        var postText    = $('#postTextarea').val();

        var dataURL = null;
        if (typeof(this.file) !== 'undefined' && this.file) {
            // dataURL = $(this.refs.cropBox.getDOMNode()).data('cropbox').getBlob();
            if (this.state.isCover) {
                dataURL = uri2blob($('#cropBox').cropper("getCroppedCanvas").toDataURL());
            } else {
                dataURL = uri2blob($('#cropBox').attr("src"));
            }
        }

        WondrousActions.addNewPost(
            postSubject,
            postText,
            this.file,
            dataURL,
            this.state.isCover,
            this.height,
            this.width
        );
    },

    toggleBackgroundDisplay: function() {
        // $("div#crop-box-wrapper").toggleClass("fit-to-screen-wrapper");
        // $("img#cropBox").toggleClass("fit-to-screen").toggleClass("cropper-hidden");
        if (this.loaded) {
            // console.log("state is",!this.state.isCover,"has",$("div.cropper-container").hasClass("cropper-hidden"))
            if(!this.state.isCover&&$("div.cropper-container").hasClass("cropper-hidden")){
                $("div.cropper-container").removeClass("cropper-hidden");
                $("div#crop-box-wrapper").removeClass("fit-to-screen-wrapper");
                $("img#cropBox").removeClass("fit-to-screen").addClass("cropper-hidden");
            }else if(!$("div.cropper-container").hasClass("cropper-hidden")){
                $("div.cropper-container").addClass("cropper-hidden");
                $("div#crop-box-wrapper").addClass("fit-to-screen-wrapper");
                $("img#cropBox").addClass("fit-to-screen").removeClass("cropper-hidden");
            }
        }

        this.setState({
            isCover: !this.state.isCover
        });
    },

    handleCrop: function(e) {
        var tempImg = new Image();
        tempImg.src = e.target.result;
        this.width = tempImg.width;
        this.height = tempImg.height;

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
                if (!that.state.isCover && !$("div.cropper-container").hasClass("cropper-hidden")) {
                    $("div.cropper-container").addClass("cropper-hidden");
                    $("div#crop-box-wrapper").addClass("fit-to-screen-wrapper");
                    $("img#cropBox").addClass("fit-to-screen").removeClass("cropper-hidden");
                } else if ($("div.cropper-container").hasClass("cropper-hidden")) {
                    $("div.cropper-container").removeClass("cropper-hidden");
                    $("div#crop-box-wrapper").removeClass("fit-to-screen-wrapper");
                    $("img#cropBox").removeClass("fit-to-screen").addClass("cropper-hidden");
                }
            },

            crop: function(data) {
            // Output the result data for cropping image.

            }
        });
    },

    render: function() {

        var optionClass = "post-form-bg-display-option";
        var optionActiveClass = optionClass + " post-form-bg-display-option--active";

        // onDrop={this.handleDrop} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver}
        return (
            <div id="new-post-dialogue" ref="postform" className="new-post-wrapper round-3" style={{ width: 780 }}>
                <div id="crop-box-wrapper">
                    <img id="cropBox" ref="cropBox" style={{ width: 750 }} src="/static/pictures/transparent.gif" />
                </div>

                <div>
                    <div onClick={this.toggleBackgroundDisplay} className={!this.state.isCover ? optionClass : optionActiveClass}>Cover</div>
                    <div onClick={this.toggleBackgroundDisplay} className={this.state.isCover  ? optionClass : optionActiveClass}>Fit-to-screen</div>
                </div>

                <div className="new-post-progress-bar">
                    <div className="new-post-progress-bar--juice" style={{ width: this.state.percent * 8 }}></div>
                </div>

                {/* {this.state.error ? <span>{this.state.error}% uploaded</span> : null} */}

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

                <div onClick={this.handleSubmit} id="post-button" role="button" className="post-button round-3">Share</div>
                <div onClick={this.handlePostCancel} role="button" className="post-button round-3 cancel-post-button">Cancel</div>
            </div>
        );
    },
    onTextAreaChange: function(){
        var text = this.refs.postTextArea.getDOMNode().value;

        var mentions = text.match(/\s*@\s*(\w+)/g);
        var hashtags = text.match(/\s*#\s*(\w+)/g);

    }
});

module.exports = PostForm;
