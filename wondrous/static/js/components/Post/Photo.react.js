var StatusBar = require('./StatusBar.react');
var URLGenerator = require('../../utils/URLGenerator');
var UploadStore = require('../../stores/UploadStore');
var SettingStore = require('../../stores/SettingStore');

var Photo = React.createClass({
    mixins: [
        Reflux.connect(UploadStore)
    ],

    getInitialState: function(){
        return {percent:0,error:null,completed:false};
    },

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

        var backgroundImage = null
        var isStillUploading = this.props.data.hasOwnProperty("uploadingImg")&&!this.state.completed&&this.state.percent!=0;

        if(this.props.data.ouuid){
            if(isStillUploading){
                backgroundImage = "url(" +this.props.data.uploadingImg+")"
            }else{
                backgroundImage = "url(" +URLGenerator.generateMedium(this.props.data.ouuid) +")";
            }
        }

        photoStyle = {
            backgroundImage: backgroundImage,
            height: height,
            maxHeight: 600,
        };

        return (
            <div ref="container" className="post-cover-photo cover no-top-border nh" style={photoStyle}>
                <div className="post-subject-text nh">
                    <div className="post-subject-wrapper">
                        {isStillUploading?this.state.percent+"% uploaded":<StatusBar data={this.props.data}/>}
                    </div>
                </div>
            </div>
        );
    }

});


module.exports = Photo;
