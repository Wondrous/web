$(document).ready(function () {
        $(function () {

            var container = $('.masonry');
            container.imagesLoaded(function () {
                container.masonry({
                    transitionDuration : 0,
                    itemSelector       : ".masonry-brick",
                    columnWidth        : '.grid-sizer',
                });
            });

            $(document).on('click', '.post-body', function () {
                var SPEED = 0;
                var thisPost = $(this);
                var thisBrick = thisPost.parent('.masonry-brick');
                var thisPostContent = thisPost.find('.post-content');
                var thisCoverPhoto = thisPost.find('.post-cover-photo');

                $('.backdrop').toggleClass('dimmer');
                thisPost.css('z-index', 9);

                $('.post-body').not(thisPost).removeClass('is-expanded');
                $('.post-content').not(thisPostContent).slideUp(SPEED);
                $('.post-cover-photo').not(thisCoverPhoto).removeClass('no-bottom-border');
                $('.post-content').not(thisPostContent).removeClass('no-top-border');
                $('.masonry-brick').not(thisBrick).removeClass('post-presentation');

                thisPost.toggleClass('is-expanded');
                thisPost.find('.post-cover-photo').toggleClass('no-bottom-border');
                thisPostContent.toggleClass('no-top-border');

                // Omit this line to NOT put the post into
                // presentation-mode when it's clicked.
                thisBrick.toggleClass('post-presentation');

                thisPostContent.slideToggle(SPEED);

                container.masonry();
            });

        });

        $('body').on('click', '.post-see-more', function() {
            var postText = $(this).parent().children('.post-text');
            postText.removeClass('post-see-more-effects').css('height', 'auto');
            $(this).remove();
        });

        $('body').on('click', '.banner-more-options, .post-more-options', function() {
            $(this).find('.dropdown-box').slideToggle(70);
        });

        $('body').on('click', function() {
            $('.dropdown-box').slideUp(70);
        });

        $('body').on("click", '.banner-more-options, .post-more-options, .dropdown-box', function(e) {
            e.stopPropagation();
        });

        $('body').on("click", ".tutorial-finish-btn", function() {
            $.ajax({
                type: "POST",
                url: "/ajax/hide_tutorial/",
                data: {},
                success: function(e) {
                    $(".tutorial").slideUp(200);
                }
            });
        });

        function change_url(url) {
            history.pushState({path: url}, "", url);
            // $('.main-content').load(url + ' .main-content');
            $.ajax({
                url: url,
                success: function(htmlResponse) {
                    var content = $('<div>').html(htmlResponse).find('.main-content');
                    $('.main-content').html(content);

                    // We need to reinitialize any plugins which
                    // operate on elements in the dynamically
                    // added content. This is extremely annonying.
                    // *** Look for a better solution ***
                    if( $("textarea#postTextarea").length ) {
                        // Initialize the hashtags and autosize textarea
                        initSmartTextarea();
                    }

                    if ( $('#fileuploadCoverImage').length ) {
                        // Initialize the file upload module
                        initUploadPostImage();
                    }
                }
            });
        }

        $('body').on('click', 'a:not(.__noPush)', function(e) {
            change_url($(this).attr('href')); //
            return e.preventDefault();
        });

        $(window).bind('popstate', function(event) {
            var state = event.originalEvent.state;
            if (state) {
                change_url(state.path);
            }
        });

        history.replaceState({ path: window.location.href }, '');

        var options, a;
        jQuery(function(){
            options = {
                serviceUrl:'/ajax/search/',
                onSelect: function(res) {
                    // window.location.href = res.data;
                    change_url(res.data);
                    $('#query').val('');
                }
            };
            a = $('#query').autocomplete(options);
        });

        function _toggle_sidemenu() {
            $('.sidemenu').animate({width:'toggle'}, 100);
        }

        function _remove_open_class() {
            $('.sidemenuOptions').removeClass('_open_ncg');
            // $('.sidemenuOptions').removeClass('_open_ncf');
            $('.sidemenuOptions').removeClass('_open_bmo');
        }

        function _add_open_class(cls) {
            _remove_open_class();
            $('.sidemenuOptions').addClass(cls);
        }

        function _add_sidemenu_content(clsSlang) {
            $('.sidemenuOptions').empty();
            if (clsSlang == '_open_ncg') {
                $('.sidemenuOptions').append("<h2>Notifications<h2>");
            // } else if (clsSlang == '_open_ncf') {
            //  $('.sidemenuOptions').append("<h2>NCF<h2>");
            } else if (clsSlang == '_open_bmo') {
                $('.sidemenuOptions').append("<a href='/info/about/' class='dropdown-a __noPush'>" +
                     "<div class='dropdown-element'>About us</div>" +
                     "</a>" +
                     "<a href='/info/tos/' class='dropdown-a __noPush'>" +
                     "<div class='dropdown-element'>Terms of Service</div>" +
                     "</a>" +
                     "<a href='/info/privacy/' class='dropdown-a __noPush'>" +
                     "<div class='dropdown-element'>Privacy</div>" +
                     "</a>" +
                     "<a href='/info/settings/' class='dropdown-a'>" +
                     "<div class='dropdown-element'>Account settings</div>" +
                     "</a>" +
                     "<a href='/info/feedback/' class='dropdown-a'>" +
                     "<div class='dropdown-element'>Feedback</div>" +
                     "</a>" +
                     "<hr class='dropdown-hr'/>" +
                     "<a href='/auth/logout/' class='dropdown-element __noPush' style='text-decoration: none; display: block;'>Log out</a>");
            }
        }

        function manage_sidemenu_actions(openCls) {
            if ($('.sidemenu').is(':visible')) {
                if ($('.sidemenuOptions').hasClass(openCls)) {
                    _toggle_sidemenu();
                    _remove_open_class();
                } else {
                    _add_open_class(openCls);
                    _add_sidemenu_content(openCls);
                }
            } else {
                _toggle_sidemenu();
                _add_open_class(openCls);
                _add_sidemenu_content(openCls);
            }
        }

        $('.sidemenuDefaultOptions').hide();

        $('body').on('click', '.nc-general', function() { manage_sidemenu_actions('_open_ncg'); });
        $('body').on('click', '.nc-follow', function() { manage_sidemenu_actions('_open_ncf'); });
        $('body').on('click', '.banner-more-options', function() { manage_sidemenu_actions('_open_bmo'); });

        $('.sidemenu').bind('mousewheel DOMMouseScroll', function(e) {
            var scrollTo = null;

            if (e.type == 'mousewheel') {
                scrollTo = (e.originalEvent.wheelDelta * -1);
            }
            else if (e.type == 'DOMMouseScroll') {
                scrollTo = 40 * e.originalEvent.detail;
            }

            if (scrollTo) {
                e.preventDefault();
                $(this).scrollTop(scrollTo + $(this).scrollTop());
            }
        });

        $('body').on('click', '.info-settings-item-header', function() {
            var SPEED = 100;
            var thisItemBody = $(this).parent().find('.info-settings-item-body');
            $('.info-settings-item-body').not(thisItemBody).slideUp(SPEED);
            thisItemBody.slideToggle(SPEED);
        });

        $(document).on("click", ".privacy-toggle", function() {
            $(this).toggleClass("down");
            if ($(this).hasClass("down")) {
                $(this).text("On");
            } else {
                $(this).text("Off");
            }

            $.ajax({
                type: "POST",
                url: "/ajax/toggle_profile_visibility/",
                success: function() {
                    // alert("updated");
                }
            });
        });
    });