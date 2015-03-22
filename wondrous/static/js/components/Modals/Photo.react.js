var WondrousActions = require('../../actions/WondrousActions');
var checkLogin = require('../../utils/Func').checkLogin;

var Photo = React.createClass({

	handleClose: function(evt) {
        if (checkLogin()) {
            WondrousActions.closeCardModal();
        } else {
            evt.preventDefault();
        }
	},

    render: function() {
        if (this.props.data.hasOwnProperty('repost')) {
            this.props.data = this.props.data.repost;
        }

		var height = this.props.data.height;
		var width = this.props.data.width;
		if(width&&!this.props.data.is_cover&&height){
			var scale = 1;
			if(width>750){
				scale = width/750;
			}

			width/=scale;
			height/=scale;
		}else{
			width = 750;
			height = 390;
		}

        photoStyle = {
            backgroundImage: this.props.data.ouuid!=null ? "url(http://mojorankdev.s3.amazonaws.com/" + this.props.data.ouuid+")" : null,
            height: height,
            width: width,
            margin: "0 auto",
        };


		console.log(this.props.data);
        return (
            <div onClick={this.handleClose} ref="container" className="post-cover-photo cover no-top-border nh" style={photoStyle}>
            </div>
        );
    }
});


module.exports = Photo;
