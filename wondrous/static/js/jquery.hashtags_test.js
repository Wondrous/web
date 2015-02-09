$.fn.hashtags = function() {
    $(this).wrap('<div class="post-input-wrapper"><div class="highlighter"></div></div>').unwrap().before('<div class="highlighter"></div>').wrap('<div class="typehead"></div></div>');
    $(this).addClass("post-input");
    $(this).autosize({append: "\n"});

    var _this = $(this);
    _this.on("keyup", function() {
        // $('#post-hashtags').html($(".hashtag").append(" ").text());

        var str = escapeHtml($(this).val());
        $(this).parent().parent().find(".highlighter").css("width", $(this).css("width"));
        str = str.replace(/\n/g, '<br>');
        str = linkify(str);

        if(!str.match(/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?#([a-zA-Z0-9]+)/g)) {
            
            if(!str.match(/#([a-zA-Z0-9]+)#/g)) {
                str = str.replace(/#([a-zA-Z0-9]+)/g,'<span class="hashtag">#$1</span>');
            }
            else{
                str = str.replace(/#([a-zA-Z0-9]+)#([a-zA-Z0-9]+)/g,'<span class="hashtag">#$1</span>');
            }
        }
        $(this).parent().parent().find(".highlighter").html(str);
    });
    
    $(this).parent().prev().on('click', function() {
        $(this).parent().find(".post-input").focus();
    });
};

function initSmartTextarea() {
    $("textarea#postTextarea").hashtags();
}