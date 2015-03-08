var WondrousAPI = require('../utils/WondrousAPI');
var MouseWheel = require('kd-shim-jquery-mousewheel');
var CropBox = require('jquery-cropbox');
var WondrousActions = require('../actions/WondrousActions');
var WondrousConstants = require('../constants/WondrousConstants');
var hashtags = require('jquery-hashtags');
var UserStore = require('../stores/UserStore');
var UploadStore = require('../stores/UploadStore');

var PostForm = React.createClass({
    mixins: [Reflux.listenTo(UserStore,"onUserChange"), Reflux.listenTo(UploadStore,"onUploadChange")],
    file: null,
    getInitialState: function(){
        return {percent:0,error:null};
    },

    onUploadChange: function(msg){
        if(msg.hasOwnProperty('error')){
            this.setState({error:msg.error});
        }else if(msg.hasOwnProperty('percent')){
            this.setState({percent:msg.percent});
        }else if(msg.hasOwnProperty('completed')){
            this.handleCancel();
            this.state.percent = 0;
        }
    },
    handleCrop: function(e) {
        $(this.refs.cropBox.getDOMNode()).attr('src', e.target.result);
        $(this.refs.cropBox.getDOMNode()).cropbox({
            width:  750,
            height: 390,
        }).on('cropbox',function(e,results,img){

        });
    },

    readURL: function() {
        if (this.file) {
            $('#postUploadBtn').hide();
            var reader = new FileReader();
            reader.onload = this.handleCrop
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
        var isPictureModal = (UserStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

        if(!isPictureModal){
            WondrousActions.togglePostModal();
        }else{
            WondrousActions.togglePictureModal();
        }

        // Fade out the post form
        var form = this.refs.postform.getDOMNode();
        $(form).slideDown().slideUp(200);

        if(this.file){
            this.file = null;
            $(this.refs.cropBox.getDOMNode()).data('cropbox').remove();
            $(this.refs.cropBox.getDOMNode()).attr('src',"/static/pictures/500x500.gif");
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
        var isPictureModal = (UserStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

        if(isPictureModal){
            setTimeout(this.updateProfile, 500);
        }else{
            setTimeout(this.addToFeeds, 500);
        }

    },

    handleSubmit:function(e){
        var isPictureModal = (UserStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

        if (isPictureModal) {
            if(typeof this.file !=='undefined' && this.file!=null){
                var dataURL = $(this.refs.cropBox.getDOMNode()).data('cropbox').getBlob();
                WondrousActions.addProfilePicture(this.file,dataURL);
            }
        } else {
            var postSubject     = $('#postSubject').val();
            var postText        = $('#postTextarea').val();
            var object_file_id  = $('#objectFileID').val(); // See if we have a object File value
            var postTagsRaw     = [];
            var postTagsUnique  = [];

            // Make array of raw tag data
            $('.hashtag').each(function() {postTagsRaw.push($(this).text());});

            // Create array of only unique tags (remove duplicates present in postTagsRaw)
            $.each(postTagsRaw, function(i, obj) {
                obj = obj.substring(1); // Remove first character (the hashtag #)
                if($.inArray(obj, postTagsUnique) === -1) postTagsUnique.push(obj);
            });

            uploadData = {
                'subject' : postSubject,
                'text'    : postText,
                'tags'    : postTagsUnique
            };

            var dataURL = null;
            if (typeof(this.file) !== 'undefined' && this.file) {
                uploadData.file_type = this.file.type;
                dataURL = $(this.refs.cropBox.getDOMNode()).data('cropbox').getBlob();
            }
            console.log("posting", uploadData);

            WondrousActions.addNewPost(postSubject,postText,postTagsUnique,this.file,dataURL);
        }
    },

    postTextChange: function(){

    },

    render: function(){
        var isPictureModal = (UserStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

        var divStyle = {
            display: isPictureModal?"none":"block",
            backgroundColor:"rgb(255,255,255)"
        };

        return (
            <div id="new-post-dialogue" ref="postform" className="new-post-wrapper round-3" style={{ width: 780 }}>
                <img onDrop={this.handleDrop} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver} id="cropBox" ref="cropBox" src="/static/pictures/500x500.gif"
                    style={{"MozBorderRadius": 20,
                            "KhtmlBorderRadius": 20,
                            "WebkitBorderRadius": 20,
                            "width": 750,
                            "height": 390 }}/>
                <span>{this.state.percent}% uploaded</span>
                {this.state.error?<span>{this.state.error}% uploaded</span>:null}
                <div className="new-post-element" style = {divStyle}>
                    <div style={{ position: "relative", margin: "0 auto", marginBottom : -1 }}>
                        <input id="postSubject" className="new-post-subject" maxLength="45" placeholder="Add a title!" spellCheck="False"/>
                    </div>
                </div>

                <div className="new-post-element" style = {divStyle}>
                    <div className="post-input-wrapper">
                        <div className="highlighter"></div>
                        <div className="typehead">
                            <textarea id="postTextarea" onChange={this.postTextChange} ref="postTextArea" maxLength="5000" placeholder="Write something. Post a link. Add #hashtags." className="post-input"
                            style={{ overflow: "hidden", wordWrap: "break-word", resize: "none", height: 48 }}></textarea>
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

                <div id="post-upload-file"  className="files" style={{postion: "relative", marginLeft: 5, fontSize: 14 }}></div>

                <div className="post-error-wrapper">
                    <span className="post-error"></span>
                </div>

                <div onClick={this.handleSubmit} id="post-button" role="button" className="post-button round-3">{isPictureModal?"Upload":"Share"}</div>
                <div onClick={this.handleCancel} role="button" className="post-button round-3 cancel-post-button">Cancel</div>
            </div>
        );
    },

    componentDidMount: function () {
        var isPictureModal = (UserStore.modalType == WondrousConstants.MODALTYPE_PICTURE);
        if(!isPictureModal){
            $("textarea#postTextarea").hashtags();
        }
    },

    onUserChange:function(userData){
        if (userData.hasOwnProperty('modalType')){
            this.forceUpdate();
            if (UserStore.modalOpen){
                var form = this.refs.postform.getDOMNode();
                $(form).slideDown(200);
            }
        }
    }
});

module.exports = PostForm;
