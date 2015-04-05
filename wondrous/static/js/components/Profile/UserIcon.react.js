var InfluencerBadge = require('./InfluencerBadge.react');
var WallStore = require('../../Stores/WallStore');
var URLGenerator = require('../../utils/URLGenerator');

var UserIcon = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    loadWall: function(evt){
        WallStore.loadMore(this.props.user.username);
    },
    render: function() {
        var is_influencer = (this.props.user.wondrous_score >= 75);
        var hrefPlaceholder = "/" + this.props.user.username;
        return (
            <li onClick={this.loadWall} className="user-itemizer">
                <Link className="avatar" to={hrefPlaceholder}>
                    <img className="profile-photo-med round-50" src={(typeof this.props.user.ouuid !== 'undefined') ? URLGenerator.generate150(this.props.user.ouuid):"https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/defaults/p.default-profile-picture.jpg"} />
                </Link>
                <div className="user-itemizer-data">
                    <Link className="user-itemizer-data-name" to={hrefPlaceholder} >{ this.props.user.name }</Link>
                    <div className="user-itemizer-data-desc">
                        @{ this.props.user.username }
                    </div>
                    {is_influencer ?
                        <InfluencerBadge size="small" />
                        : null}
                </div>
            </li>
        );
    }
});

module.exports = UserIcon;
