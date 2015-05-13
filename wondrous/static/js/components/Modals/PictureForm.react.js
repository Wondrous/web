var WondrousAPI = require('../../utils/WondrousAPI');
var WondrousActions = require('../../actions/WondrousActions');
var WondrousConstants = require('../../constants/WondrousConstants');
var ModalStore = require('../../stores/ModalStore');
var PostFormStore = require('../../stores/PostFormStore');
var UploadStore = require('../../stores/UploadStore');

var uri2blob = require('../../utils/Func').uri2blob;
var buildCropper = require('../../utils/Func').buildCropper;
var DownScaleImage = require('../../utils/DownScaleImage');

var PictureForm = React.createClass({
    mixins: [
        Reflux.listenTo(PostFormStore, 'onPostFormChange'),
        Reflux.connect(UploadStore)
    ],

    getInitialState: function() {
        return {
            percent: 0,
            error: null,
            completed:false
        };
    },

    onPostFormChange: function(msg){
        if(ModalStore.pictureFormOpen){
            if (msg.hasOwnProperty('error')) {
                this.setState({error: msg.error});
            } else if (msg.hasOwnProperty('dataURL')){
                $(this.refs.cropPictureBox.getDOMNode()).attr('src', msg.dataURL);
                buildCropper(this.refs.cropPictureBox.getDOMNode(), false);
                this.setState({loaded:PostFormStore.loaded});
            }
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

        PostFormStore.loadFile(files[0]);
        if (files[0]){
            $(this.refs.pictureUploadBtn.getDOMNode()).hide();
        }
    },

    handlePictureCancel: function(e){
        PostFormStore.unloadUser();
        this.loaded = false;
        this.props.handleClose(e);

        // Fade out the post form
        $(this.refs.cropPictureBox.getDOMNode()).cropper('destroy');
        $(this.refs.cropPictureBox.getDOMNode()).attr('src', "https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/transparent.gif");
        $(this.refs.pictureUploadBtn.getDOMNode()).show();
    },

    handleSubmit:function(e){
        if (typeof PostFormStore.file !=='undefined' && PostFormStore.file !== null){
            var sourceImg = new Image();
            var dataURL = $(this.refs.cropPictureBox.getDOMNode()).cropper("getCroppedCanvas").toDataURL();

            sourceImg.onload = function(){
                WondrousActions.addProfilePicture(PostFormStore.file,
                    {
                        "dataURL":dataURL,
                        "fullsize":uri2blob(dataURL),
                        "150x150":uri2blob(DownScaleImage(sourceImg,1/(sourceImg.height/150)).toDataURL()),
                        "75x75":uri2blob(DownScaleImage(sourceImg,1/(sourceImg.height/75)).toDataURL()),
                        "45x45":uri2blob(DownScaleImage(sourceImg,1/(sourceImg.height/45)).toDataURL())
                    }
                );
            };
            sourceImg.src = dataURL;
        }
    },

    render: function() {
        // onDrop={this.handleDrop} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver}
        return (
            <div id="new-post-dialogue" ref="postform" className="new-post-wrapper round-3" style={{ width: 430 }}>
                <div id="crop-box-wrapper" className="picture-wrapper">
                    <img id="cropPictureBox" ref="cropPictureBox" style={{ width: 400 }} src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/transparent.gif" />
                </div>

                <div className="new-post-progress-bar">
                    <div className="new-post-progress-bar--juice" style={{ width: this.state.percent * 8 }}></div>
                </div>


                <div id="post-hashtags"></div>
                <div ref="pictureUploadBtn" className="upload-button fileinput-button upload-photo">
                    Upload a photo
                    <div className="upload-photo-icon">
                        I
                    </div>
                    <input accept="image/*" id="fileuploadPostImage" onChange={this.handleDrop} type="file" name="files[]"/>
                </div>

                <div id="progress" className="small-red-bar fileinput-button progress post-dialogue-progress">
                    <div className="progress-bar progress-bar-success" style={{"textAlign": "center"}}></div>
                </div>

                <div id="post-upload-file"  className="files" style={{ postion: "relative", marginLeft: 5, fontSize: 14 }}></div>

                <div className="post-error-wrapper">
                    <span className="post-error"></span>
                </div>

                <div onClick={this.handleSubmit} id="post-button" role="button" className="post-button round-3">Done</div>
                <div onClick={this.handlePictureCancel} role="button" className="post-button round-3 cancel-post-button">Cancel</div>
                {PostFormStore.loaded?<input accept="image/*" id="fileuploadPostImage" onChange={this.handleDrop} type="file" name="files[]"/>:null}
            </div>
        );
    }
});

module.exports = PictureForm;
