var PostForm = React.createClass({
    showNewPost: function(e){
        var form = this.refs.postform.getDOMNode();
        $(form).slideDown();
    },

    handleCancel:function(e){
        // Fade out the post form
        var form = this.refs.postform.getDOMNode();
        $(form).slideDown().slideUp(200);

        // Clear the post textarea and the hashtag highlighter
        $(".highlighter").empty();
        $("#postTextarea").val('');

        // Reset any post error messages
        $(".post-error").empty();
        $('.post-error-wrapper').hide();

        // Remove anything that pertains to file uploads
        $('.objectFileID').empty();
        $('#uploadedImagePreviewWrapper').empty();
        $('#filename').empty();

        $('.post-dialogue-progress').hide();
        $('#postUploadBtn').show();

        // Remove hashtags and the hashtag preview
        $('.hashtag').val('');
        $('#post-hashtags').empty();
    },

    handleSubmit:function(e){

    },

    render: function(){
        return (
            <div>
                <div onClick={this.showNewPost} id="new-post-launch" className="round-2">Make a new post</div>
                <div id="new-post-dialogue" ref="postform" className="new-post-wrapper round-3" style={{"width":"530px"}}>
                    <img id="cropBox" src="/static/pictures/500x500.gif"/>

                    <div className="new-post-element">
                        <div style={{"position":"relative", "margin":"0 auto", "marginBottom":"-1px"}}>
                            <input id="postSubject" className="new-post-subject" maxLength="45" placeholder="Add a title!" spellCheck="False"/>
                        </div>
                    </div>

                    <div className="new-post-element" style={{"backgroundColor": "rgb(255,255,255)"}}>
                        <div className="post-input-wrapper">
                            <div className="highlighter"></div>
                            <div className="typehead">
                                <textarea id="postTextarea" maxLength="5000" placeholder="Write something. Post a link. Add #hashtags." className="post-input"
                                style={{"overflow": "hidden", "wordWrap": "break-word", "resize": "none", "height": "48px"}}></textarea>
                            </div>
                        </div>
                    </div>

                    <div id="post-hashtags"></div>
                    <div id="postUploadBtn" className="upload-button round-2 fileinput-button">
                        Upload a photo
                        <input id="fileuploadPostImage" type="file" name="files[]"/>
                    </div>

                    <div id="progress" className="small-red-bar fileinput-button progress post-dialogue-progress">
                        <div className="progress-bar progress-bar-success" style={{"textAlign": "center"}}></div>
                    </div>

                    <div id="filename"></div>
                    <div id="uploadedImagePreviewWrapper"></div>
                    <input id="objectFileID" type="hidden" value=""/>

                    <div id="post-upload-file" className="files" style={{"postion": "relative","marginLeft": "5px","fontSize":"14px"}}></div>

                    <div className="post-error-wrapper">
                        <span className="post-error"></span>
                    </div>

                    <div onClick={this.handleSubmit} id="post-button" role="button" className="post-button round-3">Share</div>
                    <div onClick={this.handleCancel} role="button" className="post-button round-3 cancel-post-button">Cancel</div>
                </div>
            </div>
        );
    },

    componentDidMount: function () {
        // Example of how to write the actions that
        // will occur after React renders the item.
        // initSmartTextarea();
    }
});

module.exports = PostForm;
