var StatusBar = require('./StatusBar.react');

var Photo = React.createClass({
    render: function() {
        if (this.props.data.hasOwnProperty('repost')) {
            this.props.data.ouuid = this.props.data.repost.ouuid;
        }

        photoStyle = {
            backgroundImage: this.props.data.ouuid ? "url(http://mojorankdev.s3.amazonaws.com/" + this.props.data.ouuid+")" : "url(/static/pictures/500x500.gif)",
        };

        return (
            <div ref="container" className="post-cover-photo cover no-top-border nh" style={photoStyle}>
                    <div className="post-subject-text nh">
                        <div className="post-subject-wrapper">
                            <StatusBar data={this.props.data}/>
                        </div>
                    </div>
            </div>);
    }

});


module.exports = Photo;
