
var InfluencerBadge = React.createClass({

    render: function() {

        var size = this.props.size;
        styleAdjustmentsWrapper = null;
        styleAdjustmentsCheckmark = null;

        if (size == "small") {
            styleAdjustmentsWrapper = { fontSize: 11, fontWeight: 400, padding: "2px 6px", borderWidth: 1 };
            styleAdjustmentsCheckmark = { marginLeft: 3, fontSize: 11 };
        }

        return (
            <div className="profile-badge-influencer round-2" style={styleAdjustmentsWrapper}>
                Influencer
                <span className="profile-badge-influencer--checkmark" style={styleAdjustmentsCheckmark}>O</span>
            </div>
        );
    }
});

module.exports = InfluencerBadge; 
