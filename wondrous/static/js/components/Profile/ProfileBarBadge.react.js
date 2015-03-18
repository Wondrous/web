
var ProfileBarBadge = React.createClass({
    render: function() {
        var isInfluencer = null;
        if (this.props.name == "influence") {
            isInfluencer = this.props.number >= 75 ? "profile-header-nav-number--is-influencer" : null
        }

        return (
            <Link activeClassName="profile-header-nav-link current-tab" className="profile-header-nav-link " to={this.props.to} params={{username: this.props.username}}>
                <li className="profile-header-nav-item round-50">
                    <div className="profile-header-nav-title">{this.props.name}</div>
                    <span className={isInfluencer}>{this.props.number}</span>
                </li>
            </Link>
        );
    }
})

module.exports = ProfileBarBadge;
