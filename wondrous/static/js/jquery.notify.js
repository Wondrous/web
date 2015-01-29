$(document).ready(function() {
    $.ajax({
        type: "POST",
        url: "/ajax/notification/count/",
        data: {}, /* No data needed */
        success: function(r) {
            updateNotificationData(1);
            updateNotificationCount(r);
        }
    });

    //manual polling, not needed
    // (function poll() {
    //  setTimeout(function() {
    //      $.ajax({ url: "/ajax/notification/count/", success: function(r) {
    //         current_notificationCount = $(".notification-count-text").text();
    //         if (current_notificationCount < r['notification_count']) {
    //             updateNotificationData(1);
    //             updateNotificationCount(r);
    //             pulsateBigAlarm();
    //         }
    //      }, dataType: "json", complete: poll });
    //  }, 20000);
    // })();

    //start up loading
    function poll(){
         $.ajax({ url: "/ajax/notification/count/", success: function(r) {
            current_notificationCount = $(".notification-count-text").text();
            if (current_notificationCount < r['notification_count']) {
                updateNotificationData(1);
                updateNotificationCount(r);
            }
        }});
    }

    poll();

    // Moved inside doc ready
    $(document).on("click", ".notification-big-alarm", function() {
        $("html, body").animate({scrollTop: 0}, 300);

        $('.notification-row').slideDown(80);
        $('.notification-dropdown').show();
        return false;
    });

    function pulsateBigAlarm() {
        $('.notification-big-alarm').fadeIn(1000).delay(4000).fadeOut(1000);
    }

    function updateNotificationCount(r) {
        var notificationCount = $(".notification-count");
        var notificationCountText = $(".notification-count-text");

        var nc = r['notification_count'];
        if (nc === 0) {
            notificationCount.removeClass('notification-alert');
        } else if (nc > 0) {
            notificationCount.addClass('notification-alert');
        }

        notificationCountText.text(nc);
    }

    function incrementNotificationCount(){
        var notificationCount = $(".notification-count");
        var notificationCountText = $(".notification-count-text");

        var nc = parseInt(notificationCountText.text());
        console.log("incrementing",nc);
        nc++;
        if (nc === 0) {
            notificationCount.removeClass('notification-alert');
        } else if (nc > 0) {
            notificationCount.addClass('notification-alert');
        }

        notificationCountText.text(nc);
    }

    function updateNotificationData(batchNum) {
        $('.notification-row').remove();
        $.ajax({
            type: "POST",
            url: "/ajax/notification/get/?batch=" + batchNum,
            data: {}, /* No data needed */
            success: function(r) {
                var un = r['notification_data'];
                if (un !== null && un.length > 0) {
                    $('.notification-none').remove();
                    // Render all notifications

                    for (var i in un) {

                        var displayType = null;
                        var unread = null;

                        if ($('.notification-dropdown').is(':visible')) {displayType = "block";} else {displayType = "none";}
                        if (un[i].is_read === false) {unread = 'notification-unread';} else {unread = '';}

                        var notificationHTML = "<a class='notification-anchor' href='" + un[i].url + "?nrid=" + un[i].nid + "'>" +
                        "<div style='display:" + displayType + ";' class='notification-row " + unread + " '>" +
                        "<img class='notification-image round-5' src='" + un[i].from_photo + "'> " +
                        "<span class='notification-text'><b>" + un[i].from_name + "</b>" + un[i].ntext + "</span>" +
                        "</div>"+ "</a>";

                        $('.notificationUnreadBucket').append(notificationHTML);
                        console.log("polled notification",un[i]);

                    }
                }
            }
        });
    }

    var pushstream = new PushStream({
        host:"104.236.251.250",
        port:"80",
        modes: 'websocket'
    });

    // pushstream.onmessage=messageReceived;
    pushstream.onmessage = function(text,id,channel) {
        console.log("pulsate");
        pulsateBigAlarm();
        incrementNotificationCount();
        console.log(text,id,channel);
    };


    pushstream.onstatuschange = function(status){
        if (status==PushStream.OPEN){
        }else if (status==PushStream.CLOSED){
        }
    };
    pushstream.onerror = function(error){
        console.log("error",error);
    };

    function connectToWebsocket(channel){
        try {
            pushstream.addChannel(''+channel);
            pushstream.connect();
            console.log("ws connected to ",channel);
        } catch(e) {
            alert(e)
        };
    }

    $(window).on('beforeunload', function(){
            pushstream.disconnect();
    });

    function getMyInfo() {
        $.ajax({
            type: "POST",
            url: "/ajax/my_info/",
            success: function(data) {
                connectToWebsocket(data.id);
            }
        });
    }

    getMyInfo();

});
