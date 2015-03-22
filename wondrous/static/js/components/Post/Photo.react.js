var StatusBar = require('./StatusBar.react');

var Photo = React.createClass({
    render: function() {
        if (this.props.data.hasOwnProperty('repost')) {
            this.props.data.ouuid = this.props.data.repost.ouuid;
        }

        var height = this.props.data.height;
        if(this.props.data.height>750&&this.props.data.width>1000){
            height/=2;
        }
        photoStyle = {
            backgroundImage: this.props.data.ouuid ? "url(http://mojorankdev.s3.amazonaws.com/" + this.props.data.ouuid+")" : null,
            backgroundPosition: "center",
            height: height
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
