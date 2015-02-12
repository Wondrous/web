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

$(document).ready(function() {
    // Initialize the hashtags and autosize textarea
    initSmartTextarea();
});

// $('textarea#postTextarea').on("keyup", function() {
//     var FONT_SIZE;
//     var LINE_HEIGHT;
//     var text = $(this).val().trim();
//     if      (text.length < 100)  {FONT_SIZE = 40; LINE_HEIGHT = 45;}
//     else if (text.length < 200)  {FONT_SIZE = 38; LINE_HEIGHT = 44;}
//     else if (text.length < 300)  {FONT_SIZE = 36; LINE_HEIGHT = 43;}
//     else if (text.length < 400)  {FONT_SIZE = 34; LINE_HEIGHT = 41;}
//     else if (text.length < 500)  {FONT_SIZE = 32; LINE_HEIGHT = 39;}
//     else if (text.length < 600)  {FONT_SIZE = 30; LINE_HEIGHT = 37;}
//     else if (text.length < 700)  {FONT_SIZE = 28; LINE_HEIGHT = 35;}
//     else if (text.length < 800)  {FONT_SIZE = 26; LINE_HEIGHT = 33;}
//     else if (text.length < 900)  {FONT_SIZE = 24; LINE_HEIGHT = 31;}
//     else                         {FONT_SIZE = 24; LINE_HEIGHT = 31;}

//     $(this).css("font-size", FONT_SIZE);
//     $(".post-input").css("line-height", LINE_HEIGHT + "px");

//     $(".highlighter").css("font-size", FONT_SIZE);
//     $(".highlighter").css("line-height", LINE_HEIGHT + "px");
// });