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

        var img_src = (typeof this.props.data.user_ouuid !== 'undefined') ? URLGenerator.generate45(this.props.data.user_ouuid) : "/static/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = '/' + this.props.data.username;

        return (
            <div>
                <img ref="usericon" className="post-thumb round-50" src={img_src}/>
                <span className="post-identifier ellipsis-overflow" style={this.repost ? {top:0} : null}>
                    <Link to={hrefPlaceholder}>{name}</Link>
                    {this.repost ? <img src="/static/pictures/icons/repost/repost_gray_shadow.svg" className="post-general-icon" style={{height: 22, width: 22, top: 7}} /> : null}
                    {this.repost ? <Link className="recipient" to={hrefRepostPlaceholder}>{this.repost.name}</Link> : null}
                </span>
            </div>
        );
    }
});


module.exports = UserTitle
