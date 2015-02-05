$(document).ready(function() {
    var itemNum = $("#startItemNum").val();

    asyncLoad(itemNum);

    var _throttleTimer = null;
    var _throttleDelay = 50;
    var $window = $(window);
    var $document = $(document);

    $document.ready(function() {

        $window.off('scroll', ScrollHandler).on('scroll', ScrollHandler);

    });

    function ScrollHandler(e) {

        // --------------------------------
        // Perform an asyncLoad when the user
        // scrolls to the bottom of the page
        // --------------------------------

        // Throttle event:
        clearTimeout(_throttleTimer);
        _throttleTimer = setTimeout(function () {

           if($(window).scrollTop() + window.innerHeight > $(document).height() - 100) {
                var itemNum = $("#startItemNum").val();
                asyncLoad(itemNum);
           }

        }, _throttleDelay);
    }

    function asyncLoad(itemNum) {

        // --------------------------------
        // Kickstart the load for the
        // next batch of items
        // --------------------------------

        $.ajax({
            type: "POST",
            url: "/ajax/async_get_item_list/majority/",
            data: {"start": itemNum},
            success: function(data) {
                // Add in empty containers where each post will go
                // to preserve the order of the posts when the ajax
                // loads them
                console.log("majority",data);
                var asyncPostContainer = $("#asyncPosts");
                for (var i=0; i < data.length; i++) {
                    asyncPostContainer.append("<div class='default-loading-post' id='async_o-" + data[i].object_id + "'>" +
                            "<svg class='svgLoader' width='250' height='250' viewbox='0 0 250 250'>" +
                                "<path class='svg-border' transform='translate(125, 125)'/>" +
                                "<path class='svg-loader' transform='translate(125, 125) scale(.84)'/>" +
                            "</svg>" +
                        "</div>");
                }

                // Populate each post box with its SVG loading animation
                _showSVGLoader();
                for (var j=0; j < data.length; j++) {
                    _addPost(data, j);
                }

                itemNum = parseInt(itemNum, 10) + 10;
                $("#startItemNum").val(itemNum);
            }
        });
    }

    function _showSVGLoader() {

        // --------------------------------
        // Show all the SVG loaders at once for
        // the upcoming batch of items being loaded
        // --------------------------------

        var loader = $(".svg-loader"),
                    border = $(".svg-border"),
                    alpha = 0,
                    pi = Math.PI,
                    t = 15;

        (function draw() {
            alpha++;
            alpha %= 360;
            var r = ( alpha * pi / 180 ),
                x = Math.sin( r ) * 125,
                y = Math.cos( r ) * - 125,
                mid = ( alpha > 180 ) ? 1 : 0,
                anim = 'M 0 0 v -125 A 125 125 1 ' + mid + ' 1 ' +  x  + ' ' +  y  + ' z';
            // [x,y].forEach(function( d ){
            //  d = Math.round( d * 1e3 ) / 1e3;
            // });

            loader.attr('d', anim);
            border.attr('d', anim);

            setTimeout(draw, t); // Redraw
        })();
    }

    function _addPost(data, i) {

        // --------------------------------
        // Add a new post to post to its respective
        // container and obviously, remove the SVG
        // loader for that container
        // --------------------------------
        $.ajax({
            type: "POST",
            url: "/ajax/async_load/",
            data: {"oid": data[i].object_id},
            success: function(post_data) {
                var asyncWrap = $("#async_o-"+data[i].object_id);
                asyncWrap.removeClass("default-loading-post").children().remove();
                asyncWrap.append(post_data);
            }
        });
    }
});
