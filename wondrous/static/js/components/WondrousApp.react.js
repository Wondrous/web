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
var LandingApp = require('./Landing.react');

var WondrousApp = React.createClass({

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


});

var Routes = (
    <Route handler={WondrousApp} path="/">
        <Route name="landingBare" path="/landing" handler={LandingApp}/>
        <Route name="landing" path="/refer/:ref_uuid" handler={LandingApp}/>
        <Route name="progress" path="/progress/:uuid" handler={LandingApp}/>

        <Route name="feed" handler={Feed}/>
        <Route name="login" path="/login" handler={Login}/>
        <Route name="signup" path="/signup" handler={Signup}/>
        <Route name="settings" path="/settings" handler={Settings}/>
        {ProfileRoute}
        <DefaultRoute handler={LoggedOut}/>
    </Route>
);

module.exports = Routes;
