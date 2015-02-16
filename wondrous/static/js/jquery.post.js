// Launch new-post-dialogue
$(document).ready(function() {

    var fileToUpload = 'undefined';
    var dataURL = 'undefined';

    // Hide the comment radio buttons
    $('.comment-radio-main-wrapper').hide();

    // Launch the new post dialogue
    $('body').on('click', '#new-post-launch', function() {
        $('#new-post-dialogue').slideDown(200);
        $('#body-mask').show();
        // $('#new-post-launch').slideUp(200);
    });

    // Destroy the post form when you click the cancel button
    $('body').on('click', '.cancel-post-button', function() {
        // $('#new-post-launch').slideDown(200);
        $('#body-mask').hide();
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
    // initUploadPostImage();
    function readURL(file) {
        if (file) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#cropBox').attr('src', e.target.result);
                $('#cropBox').cropbox({
                    width:500,
                    height:500
                }).on('cropbox',function(e,results,img){
                    dataURL = img.getBlob();
                });
            }
            // reader.onloadend = function() {
            //     var tempImg = new Image();
            //     tempImg.src = reader.result;
            //     tempImg.onload = function() {
            //
            //         var MAX_WIDTH = 500;
            //         var MAX_HEIGHT = 400;
            //         var tempW = tempImg.width;
            //         var tempH = tempImg.height;
            //         if (tempW > tempH) {
            //             if (tempW > MAX_WIDTH) {
            //                tempH *= MAX_WIDTH / tempW;
            //                tempW = MAX_WIDTH;
            //             }
            //         } else {
            //             if (tempH > MAX_HEIGHT) {
            //                tempW *= MAX_HEIGHT / tempH;
            //                tempH = MAX_HEIGHT;
            //             }
            //         }
            //
            //         var canvas = document.createElement('canvas');
            //         canvas.width = tempW;
            //         canvas.height = tempH;
            //         var ctx = canvas.getContext("2d");
            //         ctx.drawImage(this, 0, 0, tempW, tempH);
            //         var dataURL = canvas.toDataURL("image/png", 0.75);
            //
            //         var data = dataURL;
            //         console.log("data",data,file.type);
            //         $('#uploadPreview').attr('src', data);
            //       }
            //
            //    }
            reader.readAsDataURL(file);
        }
    }
    // When this div changes, we add the new post image to the HTML post form
    $(document).on('change', '#fileuploadPostImage', function() {
        fileToUpload = $(this)[0].files[0];
        readURL($('#fileuploadPostImage')[0].files[0]);
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


        // Make array of raw tag data
        $('.hashtag').each(function() {postTagsRaw.push($(this).text());});

        // Make array of all links (URL) in post
        $('.postLink').each(function() {postLinks.push($(this).text());});

        // Create array of only unique tags (remove duplicates present in postTagsRaw)
        $.each(postTagsRaw, function(i, obj) {
            obj = obj.substring(1); // Remove first character (the hashtag #)
            if($.inArray(obj, postTagsUnique) === -1) postTagsUnique.push(obj);
        });

        uploadData = {
            'subject'       : postSubject,
            'text'          : postText,
            'tags'          : postTagsUnique};

        if (typeof fileToUpload !== 'undefined' && typeof dataURL !== 'undefined'){

            uploadData.file_type = fileToUpload.type;
            console.log("upload type",uploadData);
        }

        $.ajax({
            type: "POST",
            url: "/api/wall/new",
            data: uploadData,
            success: function(post_data) {

                console.log("success",post_data);
                if (post_data.hasOwnProperty('signed_request')){
                    console.log("uploading right away");
                    $('.post-dialogue-progress').show();
                    var url = post_data['signed_request'];

                    var xhr = new XMLHttpRequest();
                    if (xhr.withCredentials !== null) {
                        xhr.open('PUT', url, true);
                    } else if (typeof XDomainRequest !== "undefined") {
                        xhr = new XDomainRequest();
                        xhr.open('PUT', url);
                    } else {
                        xhr = null;
                    }

                    if (!xhr) {
                        this.onError('CORS not supported');
                    } else {
                        xhr.onload = function() {
                          if (xhr.status === 200) {
                              console.log("upload complete!");
                              fileToUpload = 'undefined';
                              dataURL = 'undefined';
                            } else {
                                console.log("upload incomplete!");
                            }
                        };
                        xhr.onerror = function() {
                            console.log("errror!!!! CORS");
                        };
                        xhr.upload.onprogress = function(e) {
                          if (e.lengthComputable) {
                            var progress = Math.round((e.loaded / e.total) * 100);
                            $('#progress .progress-bar').css('width', progress + '%');

                          }
                        };
                      }
                      xhr.setRequestHeader('Content-Type', fileToUpload.type);
                      xhr.setRequestHeader('x-amz-acl', 'public-read');
                      xhr.send(dataURL);

                }
                if (post_data['post_error']) {
                    $('.post-error-wrapper').show().slideDown(220);
                    $('.post-error').text(post_data['post_error']);
                } else {
                    $('#addPost').prepend(post_data);
                    $('#new-post-launch').slideDown(200);
                    destroyPostForm();
                }
            },
            error: function(err){
                console.log(err);
            }
        });

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
