var WondrousAPI = require('../utils/WondrousAPI');
var MouseWheel = require('kd-shim-jquery-mousewheel');
var CropBox = require('jquery-cropbox');
var WondrousActions = require('../actions/WondrousActions');
var hashtags = require('jquery-hashtags');
var UserStore = require('../stores/UserStore');

var PostForm = React.createClass({
    file: null,
    data_to_update: null,

    handleCrop: function(e) {
        $(this.refs.cropBox.getDOMNode()).attr('src', e.target.result);
        $(this.refs.cropBox.getDOMNode()).cropbox({
            width:  500,
            height: 500
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
        var isPictureModal = UserStore.isPictureModal();

        if(!isPictureModal){
            WondrousActions.toggleNewPostModal();
        }else{
            WondrousActions.togglePictureUpload();
        }

        // Fade out the post form
        var form = this.refs.postform.getDOMNode();
        $(form).slideDown().slideUp(200);

        if(this.file){
            $(this.refs.cropBox.getDOMNode()).data('cropbox').remove();
            this.file = null;
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
        var isPictureModal = UserStore.isPictureModal();

        if(isPictureModal){
            setTimeout(this.updateProfile, 500);
        }else{
            setTimeout(this.addToFeeds, 500);
        }

    },
    updateProfile:function(){
        if (this.data_to_update) {
            // console.log("data to ",this.data_to_update);
            WondrousActions.addNewProfilePicture(this.data_to_update.ouuid);
            this.data_to_update = null;
        }
    },

    addToFeeds: function() {
        if (this.data_to_update) {
            WondrousActions.addNewPost(this.data_to_update);
            this.data_to_update = null;
        }
    },

    onPostSubmitted: function(err,res) {
        if(!err) {
            this.data_to_update = res;
            if(this.file==null){
                this.handleCancel(null);
                var isPictureModal = UserStore.isPictureModal();

                if(isPictureModal){
                    setTimeout(this.updateProfile, 500);
                }else{
                    setTimeout(this.addToFeeds, 500);
                }
                return;
            }
            var dataURL = $(this.refs.cropBox.getDOMNode()).data('cropbox').getBlob();

            WondrousAPI.uploadFile({
                blob:dataURL,
                post_data:res,
                file_type:this.file.type,
                callback:this.onFileUploadComplete,
                onProgress:this.onProgress
            });

        } else {
            console.error(err);
        }
    },

    handleSubmit:function(e){
        var isPictureModal = UserStore.isPictureModal();

        if (isPictureModal) {
            if(typeof this.file.type !=='undefined' && this.file.type!=null){
                WondrousAPI.changePicture({
                    file_type:this.file.type,
                    callback:this.onPostSubmitted
                });
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

            if (typeof(this.file) !== 'undefined' && this.file) {
                uploadData.file_type = this.file.type;
            }
            console.log("posting", uploadData);

            WondrousAPI.newPost({
                uploadData:uploadData,
                callback:this.onPostSubmitted
            });
        }
    },

    postTextChange: function(){

    },

    render: function(){
        var isPictureModal = UserStore.isPictureModal();
        var isRepostModal = UserStore.isRepostModal();

        var divStyle = {
            display: isPictureModal?"none":"block",
            backgroundColor:"rgb(255,255,255)"
        };

        return (
            <div id="new-post-dialogue" ref="postform" className="new-post-wrapper round-3" style={{"width":"530px"}}>
                <img onDrop={this.handleDrop} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver} id="cropBox" ref="cropBox" src="/static/pictures/500x500.gif"
                    style={{"MozBorderRadius": "20px",
                            "KhtmlBorderRadius": "20px",
                            "WebkitBorderRadius": "20px"}}/>

                <div className="new-post-element" style = {divStyle}>
                    <div style={{"position":"relative", "margin":"0 auto", "marginBottom":"-1px"}}>
                        <input id="postSubject" className="new-post-subject" maxLength="45" placeholder="Add a title!" spellCheck="False"/>
                    </div>
                </div>

                <div className="new-post-element" style = {divStyle}>
                    <div className="post-input-wrapper">
                        <div className="highlighter"></div>
                        <div className="typehead">
                            <textarea id="postTextarea" onChange={this.postTextChange} ref="postTextArea" maxLength="5000" placeholder="Write something. Post a link. Add #hashtags." className="post-input"
                            style={{"overflow": "hidden", "wordWrap": "break-word", "resize": "none", "height": "48px"}}></textarea>
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

                <div id="post-upload-file"  className="files" style={{"postion": "relative","marginLeft": "5px","fontSize":"14px"}}></div>

                <div className="post-error-wrapper">
                    <span className="post-error"></span>
                </div>

                <div onClick={this.handleSubmit} id="post-button" role="button" className="post-button round-3">{isPictureModal?"Upload":"Share"}</div>
                <div onClick={this.handleCancel} role="button" className="post-button round-3 cancel-post-button">Cancel</div>
            </div>
        );
    },

    componentDidMount: function () {
        UserStore.addChangeListener(this._onChange);
        var isPictureModal = UserStore.isPictureModal();
        if(!isPictureModal){
            $("textarea#postTextarea").hashtags();
        }
    },

    componentWillUnmount: function(){
        UserStore.removeChangeListener(this._onChange);
    },
    _onChange:function(){
        console.log("toggle",UserStore.isPostModalOpen());

        this.forceUpdate();
        if (UserStore.isPostModalOpen()){
            var form = this.refs.postform.getDOMNode();
            $(form).slideDown(200);
        }
    }
});

module.exports = PostForm;
