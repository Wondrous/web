var WondrousActions = require('../actions/WondrousActions');

var Linkify = function(rawText, hashtagOverrideClass) {
    var textChunks = rawText.split('\n');
    var handleClose = function(evt){
        if(!evt.metaKey){
            WondrousActions.clearModal();
        }
    }

    return textChunks.map(function(segment, ind) {
        var tokens = segment.split(/(@\S*)|(#\S*)/g);
        for (var i = 0; i < tokens.length; i += 1) {
            if(typeof tokens[i]=='undefined') {
                continue;
            }

            var isHashtag = false;
            var tk = tokens[i];
            var href = null;
            if (tk.indexOf('@') > -1) {
                var temp = tk.replace('@','')
                var temp = tk.replace('*','')
                href = '/'+temp;

                isHashtag = false;
            } else if (tk.indexOf('#') > -1) {
                var temp = tk.replace('#','')
                var temp = tk.replace('*','')
                href = '/tags/'+temp;
                isHashtag = true;
            }

            var classes = "";
            if (isHashtag) {
                classes += "hashtagify ";
                if (hashtagOverrideClass) {
                    classes += hashtagOverrideClass;
                }
            } else {
                classes += "linkify ";
            }

            if (href !== null) {
                tokens[i] = <Link key={i} className={classes} to={href} onClick={handleClose} >{tokens[i]}</Link>;
            }else {
                var links = tokens[i].split(' ').map(function(word,ind){
                    if (word.indexOf('.') > -1 && word.indexOf("..") == -1 && word.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)!=null){
                        var url = word;
                        if (word.indexOf('http://')==-1){
                            url = "http://"+word;
                            console.log("adding",url);
                        }
                        return (<span key={ind}><a className="linkify" href="javascript:" onClick={function(evt) { return window.open(url) }} target="_blank">{url}</a> </span>);
                    }else{
                        return (<span key={ind}>{word+' '}</span>);
                    }
                });

                tokens[i] = <span key={i}>{links}</span>
            }

        }

        if (ind == textChunks.length - 1) {
            return (<span key={ind}>{tokens}</span>);
        } else {
            return (
                <span key={ind}>{tokens}<br /></span>
            );
        }
    });
}


module.exports = Linkify;
