var URLGenerator = require('../../utils/URLGenerator');

var UserTitle = React.createClass({
    repost: null,
    contextTypes: {
        router: React.PropTypes.func
    },
    render: function() {
        if(typeof this.props.data === 'undefined'){
            return (<div></div>);
        }
        var hrefRepostPlaceholder = '';
        var name = this.props.data.name;

        if (this.props.data.hasOwnProperty('repost')) {
            this.repost = this.props.data.repost;
            hrefRepostPlaceholder = '/' + this.repost.username;
        }

        var img_src = (typeof this.props.data.user_ouuid !== 'undefined') ? URLGenerator.generate45(this.props.data.user_ouuid) : "https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = '/' + this.props.data.username;

        // var is_influencer = (this.props.data.wondrous_score >= 75);
        var postHeaderStyles = {};
        // if (is_influencer) {
        //     postHeaderStyles['color'] = "rgb(255,255,255)";
        // }

        return (
            <div>
                <img ref="usericon" className="post-thumb round-50" src={img_src}/>
                <span className="post-identifier ellipsis-overflow" style={this.repost ? {top:0} : null}>
                    <Link style={postHeaderStyles} to={hrefPlaceholder}>{name}</Link>
                    {this.repost ? <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/repost/repost_gray_shadow.svg" className="post-general-icon" style={{height: 22, width: 22, top: 7}} /> : null}
                    {this.repost ? <Link style={postHeaderStyles} className="recipient" to={hrefRepostPlaceholder}>{this.repost.name}</Link> : null}
                </span>
            </div>
        );
    }
});


module.exports = UserTitle
