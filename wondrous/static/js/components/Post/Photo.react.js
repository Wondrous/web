var StatusBar = require('./StatusBar.react');

var Photo = React.createClass({
    render: function() {
        if (this.props.data.hasOwnProperty('repost')) {
            this.props.data.ouuid = this.props.data.repost.ouuid;
        }

        var height = this.props.data.height;
        var width = this.props.data.width;
        if (width && !this.props.data.is_cover && height) {
            var scale = 1;
            if (width > 750) scale = width / 750;
            height /= scale;
        } else {
            height = 390;
        }

        photoStyle = {
            backgroundImage: this.props.data.ouuid ? "url(http://mojorankdev.s3.amazonaws.com/" + this.props.data.ouuid+")" : null,
            height: height,
            maxHeight: 600,
        };

        return (
            <div ref="container" className="post-cover-photo cover no-top-border nh" style={photoStyle}>
                <div className="post-subject-text nh">
                    <div className="post-subject-wrapper">
                        <StatusBar data={this.props.data}/>
                    </div>
                </div>
            </div>
        );
    }

});


module.exports = Photo;
