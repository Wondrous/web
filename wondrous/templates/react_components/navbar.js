// My first React components :D
var SearchBox = React.createClass({
	render: function () {
		return (
			<form method="GET" action="/search/" style={{"display": "inline-block"}}>
        <div className="container">
          <input type="text" id="query" className="banner-input" 
          	placeholder="Search for people and #tags" name="q" 
          	data-provide="typeahead" autoComplete="off" />
        </div>
    	</form>);
	}
});

var NotificationBox = React.createClass({
	render: function () {
		return (
			<span id="right-menu" className="notification-count nc-general round-2">
        <span className="notification-count-text">0</span>
    	</span>);
	}
})

var SettingsGear = React.createClass({
	render: function () {
		return (
			<span className="banner-more-options">
        <span className="banner-options-icon">C</span>
    	</span>);
	}
});

var ProfileLink = React.createClass({
	render: function () {
		return (
			<a id="linkToProfile" href={"/" + this.props.name} 
			className="general-text banner-user-name">
        <img className="banner-user-img round-3" 
        src="/static/pictures/defaults/p.default-profile-picture.jpg" />
        {this.props.name}
    	</a>)
	}
});

var Navbar = React.createClass({
	render: function () {
		return (
			<div id="topBanner" className="top-banner">
				<a href="/" style={{"color": "rgb(235, 235, 235)"}}>
					<img src="/static/pictures/p.icon_50x50.png" className="banner-logo" />
				</a>
				<SearchBox />
				<SettingsGear />
				{/* This name is static and must change to fetch username or ID !!*/}
				<ProfileLink name="dsiah" /> 
				<NotificationBox />
			</div>);
	}
});

React.render(<Navbar />, document.body);