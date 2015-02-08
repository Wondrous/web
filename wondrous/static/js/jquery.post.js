// Launch new-post-dialogue
$(document).ready(function() {

    // Hide the comment radio buttons
    $('.comment-radio-main-wrapper').hide();

    // Launch the new post dialogue
    $('body').on('click', '#new-post-launch', function() {
        $('#new-post-dialogue').slideDown(200);
        $('#new-post-launch').slideUp(200);
    });

    // Destroy the post form when you click the cancel button
    $('body').on('click', '.cancel-post-button', function() {
        $('#new-post-launch').slideDown(200);
        destroyPostForm();
    });

    // Prevent the user from adding newlines
    // in the new post subject textarea
    $('.new-post-subject').keydown(function(e) {
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            return false;
        }
    });

    // *** This was used when we had a WYSIWYG interface ***
    // *** Not currently in use ***
    // $(".new-post-subject").keyup(function (e) {
    //     autoheight(this);
    // });

    // function autoheight(a) {
    //     if (!$(a).prop('scrollTop')) {
    //         do {
    //             var b = $(a).prop('scrollHeight');
    //             var h = $(a).height();
    //             $(a).height(h - 5);
    //         }
    //         while (b && (b != $(a).prop('scrollHeight')));
    //     };
    //     $(a).height($(a).prop('scrollHeight') - 12);
    // }

    // autoheight($(".new-post-subject"));

    // Live URL
    $('#postTextarea').liveUrl({
        success : function(data) {
           // console.log(data); // this returns the first found url data
        }
    });

    // Initialize the file upload module
    initUploadPostImage();

    // When this div changes, we add the new post image to the HTML post form
    $(document).on('change', '#fileuploadPostImage', function() {
        var fileName = $(this).val();
        $("#filename").show().html(fileName);
    });

    // When you click the new post button
    $(document).on('click', '#post-button', function() {

        $(document).ajaxStart(function () {
            $("#ajax-loading").show();
        }).ajaxStop(function () {
            $("#ajax-loading").hide();
        });

        var postSubject       = $('#postSubject').val();
        var postText          = $('#postTextarea').val();
        var postTagsRaw       = [];
        var postTagsUnique    = [];
        var postLinks         = [];
        var contextIdentifier = null;
        var ajaxRoute         = null;
        var profileID         = $('#profileID').val(); // Get the context identifier
        var postedAnon        = $("#post-anon-checkbox").is(':checked');
        var object_file_id    = $('#objectFileID').val(); // See if we have a object File value
        // var tagName     = $('#thisGlobalTagName').text();
        // var communityID = $('#communityID').text();

        if (profileID.length > 0) {
            contextIdentifier = profileID;
            ajaxRoute = "profile";
        }
        // else if (tagName.length > 0) {
        //     contextIdentifier = tagName;
        //     ajaxRoute = "tag";
        // } else if (communityID.length > 0) {
        //     contextIdentifier = communityID;
        //     ajaxRoute = "community";
        // }

        // Make array of raw tag data
        $('.hashtag').each(function() {postTagsRaw.push($(this).text());});

        // Make array of all links (URL) in post
        $('.postLink').each(function() {postLinks.push($(this).text());});

        // Create array of only unique tags (remove duplicates present in postTagsRaw)
        $.each(postTagsRaw, function(i, obj) {
            obj = obj.substring(1); // Remove first character (the hashtag #)
            if($.inArray(obj, postTagsUnique) === -1) postTagsUnique.push(obj);
        });

        if (contextIdentifier !== null && ajaxRoute !== null) {
            $.ajax({
                type: "POST",
                url: "/ajax/post/"+ ajaxRoute +"/",
                data: {
                    'post_subject'       : postSubject,
                    'post_text'          : postText,
                    'post_tags'          : postTagsUnique,
                    'post_links'         : postLinks,
                    'object_file_id'     : object_file_id,
                    'context_identifier' : contextIdentifier,
                    'post_as_checkbox'   : postedAnon,
                },
                success: function(post_data) {
                    if (post_data['post_error']) {
                        $('.post-error-wrapper').show().slideDown(220);
                        $('.post-error').text(post_data['post_error']);
                    } else {
                        $('#addPost').prepend(post_data);
                        $('#new-post-launch').slideDown(200);
                        destroyPostForm();
                    }
                }
            });
        }
    });

    function destroyPostForm() {
        // Fade out the post form
        $('#new-post-dialogue').slideUp(200);

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

        // Clear radio button
        $("input[name='post-as-radio']").prop('checked', false);
        $("input[name='hidden-from-community']").prop('checked', false);
    }

    /* ----- Comment Feature ------ */
    $('body').on('focus', '.comment-input', function() {
        var commentContext = $(this).parents('.commentContext');
        commentContext.find('.comment-radio-main-wrapper').show();
    });

    $(document).click(function() {
        $('.comment-input').filter(function () {
            if ($(this).val().trim().length === 0) {
                var commentContext = $(this).parents('.commentContext');
                _destroyCommentForm(this, commentContext);
            }
        });
    });

    $('body').on("click", '.post-footer', function(e) {
        e.stopPropagation();
    });


    $('body').on('click', '.comment-post-btn', function() {

        var errorMessage     = null;
        var commentContext   = $(this).parents('.commentContext');
        var thisCommentInput = commentContext.children('.comment-input');
        var objectID         = commentContext.data('oid');
        var commentText      = thisCommentInput.val().trim();
        var selected         = $("input[type='radio'][name='commentRadio-" + objectID + "']:checked");
        var commentAsRadio   = null;

        if (selected.length > 0) {commentAsRadio = selected.val();}

        if (objectID === null) {
            errorMessage = "There was a dreadful error and your comment could not be posted";
        } else if (commentText.length === 0) {
            errorMessage = "Really? Please add a comment before you try to add a comment...";
        } else if (commentAsRadio === null) {
            errorMessage = "Having an identity crisis? Please select who you'd like to post as";
        }

        if (errorMessage === null) {
            $.ajax({
                type: "POST",
                url: "/ajax/comment/",
                data: {
                    'comment_as_radio': commentAsRadio,
                    'comment_text': commentText,
                    'object_id': objectID,
                },
                success: function(comment_data) {
                    if (comment_data['comment_error']) {
                        commentContext.find('.comment-error-message').text(comment_data['comment_error']).show();
                    } else {
                        commentContext.find('.addComment').append(comment_data);
                        _destroyCommentForm(thisCommentInput, commentContext);
                    }
                }
            });
        } else {
            commentContext.find('.comment-error-message').text(errorMessage).show();
        }
    });

    function _destroyCommentForm(thisCommentInput, commentContext) {
        commentContext.find('.comment-radio-main-wrapper').hide();
        commentContext.find('.comment-error-message').empty();
        $(thisCommentInput).val('');
        $("input[type='radio'][name='commentRadio-" + commentContext.data('oid') + "']").prop('checked', false);
    }

});

function linkify(text) {
    //var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    //var urlRegex = /(((http|ftp|https):\/{2})+(([0-9a-z_-]+\.)+(aero|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mn|mo|mp|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|nom|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ra|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw|arpa)(:[0-9]+)?((\/([~0-9a-zA-Z\#\+\%@\.\/_-]+))?(\?[0-9a-zA-Z\+\%@\/&\[\];=_-]+)?)?))\b/im;
    var urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    return text.replace(urlRegex, function(url) {
        return '<span class="postLink">' + url + '</span>';
    });
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
        //.replace(/'/g, "&#039;");
}

function initUploadPostImage() {
    $('#fileuploadPostImage').fileupload({
        autoUpload: true,
        add: function (e, data) {
            data.url = '/ajax/upload/file/';
            data.submit(); //this will 'force' the submit in IE < 10

            $('#postUploadBtn').hide();
            $('.post-dialogue-progress').show();
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css('width', progress + '%');
        },
        done: function (e, data) {
            $('.upl').remove();
            var r = data.result;

            if (r['error_message'] !== null) {
                
                $("#filename").hide();
                $('.post-error-wrapper').show().slideDown(220);
                $('.post-error').text(r['error_message']);
                $('#postUploadBtn').show();
                $('.post-dialogue-progress').hide();

            } else {
                $('.post-error-wrapper').hide();
                $('.post-error').empty();
                
                if (r['file_url'] !== null && r['is_img'] === true) {
                    $("#uploadedImagePreviewWrapper").html("<img class='imagePreview round-5' src='" + r['file_url'] + "'>");
                }
                $('#objectFileID').val(r['object_file_id']);
            }
        }
    });
}

