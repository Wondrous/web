var WondrousAPI = require('../../utils/WondrousAPI');
var WondrousActions = require('../../actions/WondrousActions');
var WondrousConstants = require('../../constants/WondrousConstants');
var ModalStore = require('../../stores/ModalStore');
var SettingStore = require('../../stores/SettingStore');
var PostFormStore = require('../../stores/PostFormStore');

var uri2blob = require('../../utils/Func').uri2blob;
var DownScaleImage = require('../../utils/DownScaleImage');
var buildCropper = require('../../utils/Func').buildCropper;

function resizeImage(url, callback) {
    var sourceImage = new Image();

    sourceImage.onload = function() {
        // Create a canvas with the desired dimensions
        var canvas = document.createElement("canvas");

        var height = this.height;
        var width = this.width;

        var scale = 1;
        if (width > 750) scale = 750/width;
        height *= scale;
        width *= scale;

		if(scale<1){
			canvas = DownScaleImage(sourceImage,scale);
			console.log("downscaling");
		}else{
			canvas.width = width;
			canvas.height = height;
			console.log("upscaling");
			canvas.getContext("2d").drawImage(sourceImage, 0, 0, width, height);
		}

        // Scale and draw the source image to the canvas
        // resample_hermite(canvas,this.width,this.height, width, height);
        // Convert the canvas to a data URL in PNG format
        callback(canvas.toDataURL());
    }

    sourceImage.src = url;
}

var PostForm = React.createClass({
    mixins: [
        Reflux.listenTo(PostFormStore, 'onPostFormChange'),
    ],

    getInitialState: function() {
        return {
            loaded:false,
            error: null,
            isCover: true,
			submitted: false
        };
    },

    onPostFormChange: function(msg){
        if(ModalStore.postFormOpen){
            if (msg.hasOwnProperty('error')) {
                this.setState({error: msg.error});
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
		WondrousActions.closePostModal();

        this.state.loaded = this.state.submitted = false;
		console.log(this.state.submitted);
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

    _submitData: function(postSubject,postText,blobs){
        if (PostFormStore.post_id==null){
            WondrousActions.addNewPost(
                postSubject,
                postText,
                PostFormStore.file,
                blobs,
                PostFormStore.isCover,
                PostFormStore.height,
                PostFormStore.width
            );
        }else{
            WondrousActions.newEditPost(
                postSubject,
                postText,
                PostFormStore.file,
                blobs,
                PostFormStore.isCover,
                PostFormStore.height,
                PostFormStore.width,
                PostFormStore.post_id
            );
        }
    },

    handleSubmit:function(e){
		var postSubject = $('#postSubject').val();
		var postText    = $('#postTextarea').val();

		if (postSubject.length==0||postText.length==0){
			this.state.error="Please fill in a subject and write some text";
            this.forceUpdate();
            return;
		}

        if(SettingStore.uploading){
            this.state.error="already uploading something else"
            this.forceUpdate();
            return;
        }

        SettingStore.uploading = PostFormStore.file!=null;
        if (typeof(PostFormStore.file) !== 'undefined' && PostFormStore.file) {
            var dataURL = null;
            var dataBlob = null;

            if (PostFormStore.isCover) {
                dataURL = $(this.refs.cropBox.getDOMNode()).cropper("getCroppedCanvas").toDataURL()
                dataBlob = uri2blob(dataURL);
            } else {
                dataURL = $(this.refs.fsBox.getDOMNode()).attr("src");
                dataBlob = uri2blob(dataURL);
            }

            var that = this;
            resizeImage(dataURL,function(mediumDataURL){
                var blobs = {"fullsize": dataBlob,"medium":uri2blob(mediumDataURL), "dataURL":mediumDataURL}
                that._submitData(postSubject,postText,blobs);
            });
        }else{
			this._submitData(
				postSubject,
                postText,
				null
			);
        }

		this.handlePostCancel();
    },

    render: function() {

        var optionClass = "post-form-bg-display-option";
        var optionActiveClass = optionClass + " post-form-bg-display-option--active";
		var buttonStyle = {'display':!this.state.submitted?"block":"none"}

        // onDrop={this.onFileSelect} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver}
        return (
            <div id="new-post-dialogue" ref="postform" className="new-post-wrapper round-3" style={{ width: 780 }}>
                <div id="full-screen-wrapper" className="fit-to-screen-wrapper" style={{display:PostFormStore.isCover?"none":"block"}}>
                    <img id="fsBox" ref="fsBox" className="fit-to-screen" style={{ width: 750 }} src="/static/pictures/transparent.gif" />
                </div>
                <div id="crop-box-wrapper" style={{display:PostFormStore.isCover?"block":"none"}}>
                    <img id="cropBox" ref="cropBox" style={{ width: 750 }} src="/static/pictures/transparent.gif" />
                </div>

                <div>
                    <div onClick={PostFormStore.toggleBackgroundDisplay} className={!PostFormStore.isCover ? optionClass : optionActiveClass}>Cover</div>
                    <div onClick={PostFormStore.toggleBackgroundDisplay} className={PostFormStore.isCover  ? optionClass : optionActiveClass}>Fit-to-screen</div>
                    {PostFormStore.loaded?<input onChange={this.onFileSelect} className="fileuploadPostImage" type="file" name="files[]"/>:null}
                </div>

                <div className="new-post-progress-bar">
                    <div className="new-post-progress-bar--juice" style={{ width: this.state.percent * 8 }}></div>
                </div>

                {this.state.error ? <span>{this.state.error}</span> : null}

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

                {/*}<div id="progress" className="small-red-bar fileinput-button progress post-dialogue-progress">
                    <div className="progress-bar progress-bar-success" style={{"textAlign": "center"}}></div>
                </div>*/}

                <div id="post-upload-file"  className="files" style={{ postion: "relative", marginLeft: 5, fontSize: 14 }}></div>

                <div className="post-error-wrapper">
                    <span className="post-error"></span>
                </div>

                <div ref="buttons" style={buttonStyle}>
                    <div onClick={this.handleSubmit} id="post-button" role="button" className="post-button round-3">Share</div>
                    <div onClick={this.handlePostCancel} role="button" className="post-button round-3 cancel-post-button">Cancel</div>
                </div>

            </div>
        );
    },

    onChange: function(ref){
        return function(e){
			var val = $(e.target).val();
			if (ref==='postTextArea'){
				PostFormStore.text = val;
			}else{
				PostFormStore.subject = val;
			}

            this.props.value = val;
            this.forceUpdate();
        }
    }
});

module.exports = PostForm;
