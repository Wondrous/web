var DefaultRoute = require('react-router').DefaultRoute;
var Link = require('react-router').Link;
var React = require('react');
var Route = require('react-router').Route;
var RouteHandler = require('react-router').RouteHandler;

// Stores
var FeedStore = require('../stores/FeedStore');
var ProfileStore = require('../stores/ProfileStore');
var UserStore = require('../stores/UserStore');
var WallStore = require('../stores/WallStore');

// Other components -- stitch them together
var Buffer = require('./Buffer.react');
var Feed = require('./Feed.react');
var Login = require('../components/Authenticate.react').Login;
var LoggedOut = require('../components/Authenticate.react').LoggedOut;
var Navbar = require('./Navbar.react');
var ProfileRoute = require('./Profile.react');
var Settings = require('../components/Settings.react');
var SideMenu = require('../components/SideMenu.react');
var Signup = require('../components/Authenticate.react').Signup;

var WondrousApp = React.createClass({

    // Get the initial state
    getInitialState: function() {
        return {};
    },

    // Add change listener to stores
    componentDidMount: function() {
        FeedStore.addChangeListener(this._onChange);
        WallStore.addChangeListener(this._onChange);
        UserStore.addChangeListener(this._onChange);
    },

    // Remove change listeners from stores
    componentWillUnmount: function() {
        FeedStore.removeChangeListener(this._onChange);
        WallStore.removeChangeListener(this._onChange);
        UserStore.removeChangeListener(this._onChange);
    },

    // Render our child components
    render: function() {
        return (
            <div>
                <Navbar />
                <SideMenu />
                <div className="main-content">
                    <RouteHandler />
                </div>
            </div>
        );
    },

    _onChange:function() {
        console.log("something changed!");
    }
});

var Routes = (
    <Route handler={WondrousApp} path="/">
        <Route name="feed" path="/feed" handler={Feed}/>
        <Route name="login" path="/login" handler={Login}/>
        <Route name="signup" path="/signup" handler={Signup}/>
        <Route name="settings" path="/settings" handler={Settings}/>
        {ProfileRoute}
        <DefaultRoute handler={LoggedOut}/>
    </Route>
);

module.exports = Routes;
