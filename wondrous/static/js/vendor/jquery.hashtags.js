
var autosize = require('jquery-autosize');

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
        //.replace(/'/g, "&#039;");
}

function linkify(text) {
    //var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    //var urlRegex = /(((http|ftp|https):\/{2})+(([0-9a-z_-]+\.)+(aero|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mn|mo|mp|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|nom|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ra|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw|arpa)(:[0-9]+)?((\/([~0-9a-zA-Z\#\+\%@\.\/_-]+))?(\?[0-9a-zA-Z\+\%@\/&\[\];=_-]+)?)?))\b/im;
    var urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
    return text.replace(urlRegex, function(url) {
        return '<span class="postLink">' + url + '</span>';
    });
}

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
//
// function initSmartTextarea() {
//     $("textarea#postTextarea").hashtags();
// }
//
// $(document).ready(function() {
//     // Initialize the hashtags and autosize textarea
//     initSmartTextarea();
// });
//
// // $('textarea#postTextarea').on("keyup", function() {
// //     var FONT_SIZE;
// //     var LINE_HEIGHT;
// //     var text = $(this).val().trim();
// //     if      (text.length < 100)  {FONT_SIZE = 40; LINE_HEIGHT = 45;}
// //     else if (text.length < 200)  {FONT_SIZE = 38; LINE_HEIGHT = 44;}
// //     else if (text.length < 300)  {FONT_SIZE = 36; LINE_HEIGHT = 43;}
// //     else if (text.length < 400)  {FONT_SIZE = 34; LINE_HEIGHT = 41;}
// //     else if (text.length < 500)  {FONT_SIZE = 32; LINE_HEIGHT = 39;}
// //     else if (text.length < 600)  {FONT_SIZE = 30; LINE_HEIGHT = 37;}
// //     else if (text.length < 700)  {FONT_SIZE = 28; LINE_HEIGHT = 35;}
// //     else if (text.length < 800)  {FONT_SIZE = 26; LINE_HEIGHT = 33;}
// //     else if (text.length < 900)  {FONT_SIZE = 24; LINE_HEIGHT = 31;}
// //     else                         {FONT_SIZE = 24; LINE_HEIGHT = 31;}
//
// //     $(this).css("font-size", FONT_SIZE);
// //     $(".post-input").css("line-height", LINE_HEIGHT + "px");
//
// //     $(".highlighter").css("font-size", FONT_SIZE);
// //     $(".highlighter").css("line-height", LINE_HEIGHT + "px");
// // });
