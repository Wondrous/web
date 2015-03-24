var WondrousAPI = require('../../utils/WondrousAPI');
var WondrousActions = require('../../actions/WondrousActions');
var WondrousConstants = require('../../constants/WondrousConstants');
var ModalStore = require('../../stores/ModalStore');
var PostFormStore = require('../../stores/PostFormStore');

var uri2blob = require('../../utils/Func').uri2blob;
var buildCropper = require('../../utils/Func').buildCropper;

function resizeImage(url, callback) {
    var sourceImage = new Image();

    sourceImage.onload = function() {
        // Create a canvas with the desired dimensions
        var canvas = document.createElement("canvas");

        var height = this.height;
        var width = this.width;
        var scale = 1;
        if (width > 750) scale = width / 750;
        height /= scale;
        width /= scale;

        canvas.width = width;
        canvas.height = height;

        // Scale and draw the source image to the canvas
        canvas.getContext("2d").drawImage(sourceImage, 0, 0, width, height);

        // Convert the canvas to a data URL in PNG format
        callback(canvas.toDataURL());
    }

    sourceImage.src = url;
}

var PostForm = React.createClass({
    mixins: [
        Reflux.listenTo(PostFormStore, 'onPostFormChange')
    ],

    getInitialState: function() {
        return {
            loaded:false,
            percent: 0,
            error: null,
            isCover: true,
        };
    },

    onPostFormChange: function(msg){
        if(ModalStore.postFormOpen){
            if (msg.hasOwnProperty('error')) {
                this.setState({error: msg.error});
            } else if (msg.hasOwnProperty('percent')) {
                this.setState({percent: msg.percent});
            } else if (msg.hasOwnProperty('completed')) {
                this.handlePostCancel();
                this.state.percent = 0;
            } else if (msg.hasOwnProperty('isCover')){
                this.setState(msg);
            } else if (msg.hasOwnProperty('dataURL')){
                $(this.refs.cropBox.getDOMNode()).attr('src', msg.dataURL);
                $(this.refs.fsBox.getDOMNode()).attr('src', msg.dataURL);
                buildCropper(this.refs.cropBox.getDOMNode(),true);
                this.setState({loaded:PostFormStore.loaded});
            }else if (msg.hasOwnProperty('url')){
                $(this.refs.cropBox.getDOMNode()).attr('src', msg.url);
                $(this.refs.fsBox.getDOMNode()).attr('src', msg.url);
                buildCropper(this.refs.cropBox.getDOMNode(),true);
                this.setState({loaded:PostFormStore.loaded});
            }
        }
    },

    onFileSelect: function(e){
        e.preventDefault();

        var files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }

        PostFormStore.loadFile(files[0]);
        if (files[0]){
            $(this.refs.postUploadBtn.getDOMNode()).hide();
        }
    },

    handlePostCancel: function(e){
        PostFormStore.unloadUser();
        this.loaded = false;
        this.props.handleClose(e);

        // Fade out the post form
        $(this.refs.cropBox.getDOMNode()).cropper('destroy');
        $(this.refs.cropBox.getDOMNode()).attr('src', "/static/pictures/transparent.gif");
        $(this.refs.fsBox.getDOMNode()).attr('src', "/static/pictures/transparent.gif");

        if(this.file){
            this.file = null;
            $(this.refs.cropBox.getDOMNode()).cropper('destroy');
        }

        $("#postTextarea").val('');
        $("#postSubject").val('');

        // Reset any post error messages
        $(".post-error").empty();
        $('.post-error-wrapper').hide();

        $('.post-dialogue-progress').hide();
        $(this.refs.postUploadBtn.getDOMNode()).show();
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

    _submitData: function(postSubject,postText,blobs){
        if (PostFormStore.post_id==null){
            WondrousActions.addNewPost(
                postSubject,
                postText,
                PostFormStore.file,
                blobs,
                this.state.isCover,
                PostFormStore.height,
                PostFormStore.width
            );
        }else{
            WondrousActions.newEditPost(
                postSubject,
                postText,
                PostFormStore.file,
                blobs,
                this.state.isCover,
                PostFormStore.height,
                PostFormStore.width,
                PostFormStore.post_id
            );
        }
    },

    handleSubmit:function(e){
        var postSubject = $('#postSubject').val();
        var postText    = $('#postTextarea').val();


        if (typeof(PostFormStore.file) !== 'undefined' && PostFormStore.file) {
            if (this.state.isCover) {
                var dataURL = uri2blob($(this.refs.cropBox.getDOMNode()).cropper("getCroppedCanvas").toDataURL());
                var medium = uri2blob($(this.refs.cropBox.getDOMNode()).cropper("getCroppedCanvas",{width:750,heihgt:390}).toDataURL());
                var blobs = {"fullsize": dataURL,"medium":medium}
                this._submitData(postSubject,postText,blobs);
            } else {
                var that = this;
                var dataURL = uri2blob($(this.refs.fsBox.getDOMNode()).attr("src"));
                resizeImage($(this.refs.fsBox.getDOMNode()).attr("src"),function(mediumDataURL){
                    var blobs = {"fullsize": dataURL,"medium": uri2blob(mediumDataURL)}
                    that._submitData(postSubject,postText,blobs);
                });
            }
        }
    },

    render: function() {

        var optionClass = "post-form-bg-display-option";
        var optionActiveClass = optionClass + " post-form-bg-display-option--active";

        // onDrop={this.onFileSelect} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver}
        return (
            <div id="new-post-dialogue" ref="postform" className="new-post-wrapper round-3" style={{ width: 780 }}>
                <div id="full-screen-wrapper" className="fit-to-screen-wrapper" style={{display:this.state.isCover?"none":"block"}}>
                    <img id="fsBox" ref="fsBox" className="fit-to-screen" style={{ width: 750 }} src="/static/pictures/transparent.gif" />
                </div>
                <div id="crop-box-wrapper" style={{display:this.state.isCover?"block":"none"}}>
                    <img id="cropBox" ref="cropBox" style={{ width: 750 }} src="/static/pictures/transparent.gif" />
                </div>

                <div>
                    <div onClick={PostFormStore.toggleBackgroundDisplay} className={!this.state.isCover ? optionClass : optionActiveClass}>Cover</div>
                    <div onClick={PostFormStore.toggleBackgroundDisplay} className={this.state.isCover  ? optionClass : optionActiveClass}>Fit-to-screen</div>
                    {PostFormStore.loaded?<input onChange={this.onFileSelect} className="fileuploadPostImage" type="file" name="files[]"/>:null}
                </div>

                <div className="new-post-progress-bar">
                    <div className="new-post-progress-bar--juice" style={{ width: this.state.percent * 8 }}></div>
                </div>

                {/* {this.state.error ? <span>{this.state.error}% uploaded</span> : null} */}

                <div className="new-post-element">
                    <div style={{ position: "relative", margin: "0 auto", marginBottom : -1 }}>
                        <input ref="postSubject" id="postSubject" onChange={this.onChange("postSubject")} className="new-post-subject" maxLength="45" placeholder="Add a title!" spellCheck="False" value={PostFormStore.subject}/>
                    </div>
                </div>

                <div className="new-post-element">
                    <div className="post-input-wrapper">
                        <div className="typehead">
                            <textarea onChange={this.onChange("postTextArea")} id="postTextarea" ref="postTextArea" maxLength="5000" placeholder="Write something. Post a link. Add #hashtags." className="post-input"
                            style={{ overflow: "y-scroll", wordWrap: "break-word", resize: "none", height: 48 }} value={PostFormStore.text}></textarea>
                        </div>
                    </div>
                </div>

                <div ref="postUploadBtn" className="upload-button fileinput-button">
                    Upload a photo
                    <div className="upload-photo-icon">
                        I
                    </div>
                    <input id="fileuploadPostImage" onChange={this.onFileSelect} type="file" name="files[]"/>
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

    onChange: function(ref){
        return function(e){
            var val = $(e.target).val();
            this.props.value = val;
            this.forceUpdate();
        }
    }
});

module.exports = PostForm;
