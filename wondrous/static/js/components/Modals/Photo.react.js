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

        photoStyle = {
            backgroundImage: this.props.data.ouuid!=null ? "url(http://mojorankdev.s3.amazonaws.com/" + this.props.data.ouuid+")" : null,
            height: this.props.data.height && !this.props.is_cover ? this.props.data.height : 390,
            width: this.props.data.width && !this.props.is_cover ? this.props.data.width : 750,
            maxWidth: 750,
            maxHeight: 600,
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
