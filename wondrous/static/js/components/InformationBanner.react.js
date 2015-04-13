var WondrousActions = require('../actions/WondrousActions');

var InformationBanner = React.createClass({

	handleClick: function() {
		// What happens when the user clicks on the banner?
		if (this.props.actionType == "loadPost") {
			WondrousActions.newPostLoad(166);
		} else if (this.props.actionType == "uploadProfilePicture") {
			WondrousActions.openPictureModal();
		} else {
			// Do nothing
		}
	},

	render: function() {
		var bannerText = this.props.text;
		var bannerType = this.props.bannerType;
		var actionType = this.props.actionType;
		var canExit    = this.props.canExit;
		var styles 	   = this.props.styles;
		var classes    = "information-banner round-2 ";

		// What color do we want the banner?
		if (bannerType == "general") {
			classes += "information-banner--general";
		} else if (bannerType == "alert") {
			classes += "information-banner--alert";
		} else if (bannerType == "warn") {
			classes += "information-banner--warn";
		} else {
			classes += "information-banner--general";
		}

		return (
			<div ref="infoBanner" onClick={this.handleClick}>
				<div className={classes} style={styles}>
					{bannerText}
					{canExit == "true" ? 
						<span ref="infoBannerExit" onClick={this.exitInfoBanner} style={{ fontFamily: "heydings_iconsregular", float: "right" }} title="Close this banner">
							X
						</span>
						: null}
				</div>
			</div>
		);
	},

	exitInfoBanner: function() {
		var infoBanner = this.refs.infoBanner.getDOMNode();
		$(infoBanner).remove();
	}
});

module.exports = InformationBanner;