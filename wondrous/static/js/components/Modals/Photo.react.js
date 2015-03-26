var URLGenerator = require("../../utils/URLGenerator");

var Photo = React.createClass({

    render: function() {
        if (this.props.data.hasOwnProperty('repost')) {
            this.props.data = this.props.data.repost;
        }

		var height = this.props.data.height;
		var width = this.props.data.width;
		// if(width && !this.props.data.is_cover && height) {
		// 	var scale = 1;
		// 	if (width > 750) {
		// 		scale = width / 750;
		// 	}
		// 	width /= scale;
		// 	height /= scale;
		// } else {
		// 	width = 750;
		// 	height = 390;
		// }

        var isCover = this.props.data.is_cover;
        var MAX_HEIGHT = 550;
        var MAX_WIDTH  = 750;

        // Must check for height and width to keep backwards comptibility
        // Some older photos don't have HxW, so they return null for these,
        // in which case auto won't work.
        photoStyle = {
            height: height && !isCover ? "auto" : 390,
            width: width && !isCover ? "auto" : 750,
            maxWidth: MAX_WIDTH,
            maxHeight: MAX_HEIGHT,
            margin: "0 auto",
            display: "block",
        };

        var backgroundImage = null;
        var imgSrc = null;
        var isStillUploading = this.props.data.hasOwnProperty("uploadingImg");
        if(this.props.data.ouuid) {
            if(isStillUploading) {
                backgroundImage = "url(" +this.props.data.uploadingImg+")"
                imgSrc = this.props.data.uploadingImg;
            } else {
                backgroundImage = "url(" +URLGenerator.generateMedium(this.props.data.ouuid) +")";
                imgSrc = URLGenerator.generateMedium(this.props.data.ouuid);
            }
        }

        // We need both of these for backwards comptibility
        // so we don't break posts with cover photos that
        // have is_cover = null.
        if (isCover === true || isCover === null) {
            photoStyle['backgroundImage'] = backgroundImage;
            return (
                <div className="_postImg" onClick={this.handleClose} ref="container" className="post-cover-photo cover no-top-border nh" style={photoStyle}>
                </div>
            );
        } else {
            return (
                <div>
                    <img className="_postImg" onClick={this.handleClose} src={imgSrc} style={photoStyle} />
                </div>
            );
        }
    },

    componentDidMount: function() {
        $('._postImg').on('dragstart', function(event) {
            event.preventDefault();
        });
    }
});


module.exports = Photo;
