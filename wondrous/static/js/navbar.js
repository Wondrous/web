
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
});

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
            <a id="linkToProfile" href={"/" + this.props.user.username}
                className="general-text banner-user-name">
                <img className="banner-user-img round-3"
                    src="/static/pictures/defaults/p.default-profile-picture.jpg" />
                {this.props.user.first_name}
            </a>);
    }
});

var Navbar = React.createClass({
    loadUserFromServer: function(){
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: "/api/me",
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr,status,err){
                this.setState({data: {}});
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadUserFromServer();
    },
    render: function () {
        return (
            <div id="topBanner" className="top-banner">
                <a href="/" style={{"color": "rgb(235, 235, 235)"}}>
                    <img src="/static/pictures/p.icon_50x50.png" className="banner-logo" />
                </a>
                <SearchBox />
                <SettingsGear />
                <ProfileLink user={this.state.data} />
                <NotificationBox />
            </div>);
    }
});

var Buffer = React.createClass({
    render: function () {
        return (<div style={{"height": 45}}></div>);
    }
});