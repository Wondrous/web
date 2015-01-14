$(document).ready(function() {
    
    // Get link to this post
    $('body').on("click", ".linkToPost", function() {
        var ol = $(this).parents('.post-body').find('.linkUrl').val();
        $('#loading-mask').show();
        $(document.body).append("<div class='get-link-popup round-5'>" +
                                    "<span class='get-link-x round-5'>X</span>" +
                                    "<input class='get-link-input' type='text' value='" + ol + "'>" +
                                "</div>").fadeIn(200);
        $(".get-link-input").focus();
    });

    $('body').on("click", ".get-link-x", function() {
        killGetLink();
    });

    // Cancel actions
    $('body').on("click", ".cancelPopupBtn", function() {
        killPopup();
    });

    // DELETE CONTENT
    // Press the delete button
    $('body').on("click", ".deleteContent", function() {
        var oid = $(this).parents('.post-body').find('.objectID').val();
        $('#loading-mask').show();
        $(document.body).append("<div class='popup-box round-3'>" +
                                    "<div class='popup-box-header'>Are you sure you want to delete this post?</div>" +
                                    "<span class='popup-btn popup-yes round-2 style-warn confirmDelete' data-oid='" + oid + "'>Delete</span>" +
                                    "<span class='popup-btn popup-no cancelPopupBtn'>Cancel</span>" +
                                "</div>").fadeIn(200);
    });

    $('body').on("click", ".confirmDelete", function() {
        var thisObjectID = $(this).data('oid');
        var postBody = $('#post-' + thisObjectID);

        $.ajax({
            type: "POST",
            url: "/ajax/delete_content/",
            data: {'object_id': thisObjectID,},
            success: function(e) {
                var error_message = e['error_message'];
                if (error_message === null) {
                    postBody.slideUp(200).remove();
                    killPopup();
                } else {
                    alert(error_message);
                }
            }
        });
    });

    // REPORT CONTENT
    // Press the Report button
    $('body').on("click", ".reportContent", function() {
        var oid = $(this).parents('.post-body').find('.objectID').val();
        $('#loading-mask').show();
        $(document.body).append("<div class='popup-box round-3'>" +
                                    "<div class='popup-box-header report-header'><b>Resolve a problem</b></div>" +
                                    "<div style='text-align: left;'>" +
                                        "<div style='margin: 7px; font-size: 15px;'><b>What is the problem?</b></div>" +
                                        "<div class='report-radio-option'><input type='radio' name='why_id' value='1'> It's annoying or not interesting</div>" +
                                        "<div class='report-radio-option'><input type='radio' name='why_id' value='2'> I'm involved in this post and I don't like it</div>" +
                                        "<div class='report-radio-option'><input type='radio' name='why_id' value='3'> I think this is inappropriate for MojoRank</div>" +
                                        "<div class='report-radio-option'><input type='radio' name='why_id' value='4'> It's spam</div>" +
                                    "</div>" +
                                    "<hr>" +
                                    "<div style='margin-top: 15px;'><textarea id='reportComment' class='report-textarea' placeholder='Please add an additional comment explaining why this post was problematic. This is important and helps MojoRank make appropriate decisions.'></textarea></div>" +
                                    "<div id='report-error-message'></div>" +
                                    "<span class='popup-btn popup-yes round-2 style-warn confirmReport' data-oid='" + oid + "'>Report</span>" +
                                    "<span class='popup-btn popup-no cancelPopupBtn'>Cancel</span>" +
                                "</div>").fadeIn(200);
    });

    $('body').on("click", ".confirmReport", function() {
        var thisObjectID = $(this).data('oid');
        var postBody = $('#post-' + thisObjectID);

        var reportTextareaContent = $('textarea#reportComment').val().trim();
        var reportRadioSelectedVal = $('input[name=why_id]:checked').val();
        if (reportTextareaContent.length > 0 && $.inArray(reportRadioSelectedVal, ["1","2","3","4"]) > -1) {
            $.ajax({
                type: "POST",
                url: "/ajax/report_content/",
                data: {
                    'object_id': thisObjectID,
                    'report_comment': reportTextareaContent,
                    'why_id': reportRadioSelectedVal
                },
                success: function(e) {
                    var error_message = e['error_message'];
                    if (error_message === null) {
                        postBody.slideUp(200).remove();
                        $('.popup-box').html(
                            "<div style='text-align: left; font-weight: bold; color: rgb(251,251,251); background-color: rgb(120,120,120); padding: 10px;'>" +
                                e['success_message'] +
                            "</div>" +
                            "<span class='popup-btn popup-yes style-neutral cancelPopupBtn'>Done</span>"
                        );
                    } else {
                        $("#report-error-message").text();
                        $("#report-error-message").text(error_message);
                    }
                }
            });
        } else {
            console.log("ERROR");
            // $("#report-error-message").text();
            $("#report-error-message").text("You must select a value and add a comment for this report to be processed. Thank you.");
        }
    });

    function killPopup() {
        $('#loading-mask').hide();
        $('.popup-box').fadeOut(200).remove();
    }

    function killGetLink() {
        $('#loading-mask').hide();
        $('.get-link-popup').fadeOut(200).remove();
    }


    // Report/Delete dropdown menu --------------------------
    $(".post-more-options").hide();

    $('body').on("mouseenter", ".post-body", function() {
        if (!$('.dropdown-box').is(":visible")) {
            $(".post-more-options").hide();
            $(this).find(".post-more-options").fadeIn(50).css("display", "inline-block");
        }
    }).on("mouseleave", ".post-body", function() {
        if ($(this).find('.dropdown-box').is(":visible")) {
            $(this).find(".post-more-options").show().css("display", "inline-block");
        }
        else {
            $(this).find(".post-more-options").hide();
        }
    });

    // Comments ----------------------------------------------

    // Show/hide the delete x for a given comment
    $('body').on("mouseenter", ".comment-wrapper", function() {
        $(this).children(".comment-delete").show();
    }).on("mouseleave", ".comment-wrapper", function() {
        $(this).children(".comment-delete").hide();
    });

    // When you click the X for a comment, show popup confirm window
    // Cancel actions
    $('body').on("click", ".cancelPopupBtn", function () {
        killPopup();
    });

    // DELETE CONTENT
    // Press the delete button
    $('body').on("click", ".comment-delete", function() {
        var oid = $(this).parents('.post-body').find('.objectID').val();
        var cid = $(this).data('cid');
        $('#loading-mask').show();
        $(document.body).append("<div class='popup-box round-3'>" +
                                    "<div class='popup-box-header'>Are you sure you want to delete this comment?</div>" +
                                    "<span class='popup-btn popup-yes round-2 style-warn confirmDeleteComment' data-cid='" + cid + "' data-oid='" + oid + "'>Delete</span>" +
                                    "<span class='popup-btn popup-no cancelPopupBtn'>Cancel</span>" +
                                "</div>").fadeIn(200);
    });

    $('body').on("click", ".confirmDeleteComment", function() {
        var thisObjectID  = $(this).data('oid');
        var thisCommentID = $(this).data('cid');
        var commentBody = $('#comment-' + thisCommentID);

        $.ajax({
            type: "POST",
            url: "/ajax/delete_comment/",
            data: {'comment_id': thisCommentID, 'object_id': thisObjectID,},
            success: function(e) {
                var error_message = e['error_message'];
                if (error_message === null) {
                    commentBody.slideUp(200).remove();
                    killPopup();
                } else {
                    alert(error_message);
                }
            }
        });
    });
});

