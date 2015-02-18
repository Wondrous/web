var React = require('react');
var Route = require('react-router').Route;
var RouteHandler = require('react-router').RouteHandler;
var Link = require('react-router').Link;
var DefaultRoute = require('react-router').DefaultRoute;

// Stores
var FeedStore = require('../stores/FeedStore');
var WallStore = require('../stores/WallStore');
var UserStore = require('../stores/UserStore');
var ProfileStore = require('../stores/ProfileStore');

// Other components -- stitch them together
var Navbar = require('./Navbar.react');
var Buffer = require('./Buffer.react');
var Feed = require('./Feed.react');
var ProfileRoute = require('./Profile.react');
var LoggedOut = require('../components/Authenticate.react').LoggedOut;
var Signup = require('../components/Authenticate.react').Signup;
var Login = require('../components/Authenticate.react').Login;
var SideMenu = require('../components/SideMenu.react')

var WondrousApp = React.createClass({

    // Get the initial state
    getInitialState: function(){
        return {};
    },

    // Add change listener to stores
    componentDidMount: function(){
        FeedStore.addChangeListener(this._onChange);
        WallStore.addChangeListener(this._onChange);
        UserStore.addChangeListener(this._onChange);
    },

    // Remove change listeners from stores
    componentWillUnmount: function(){
        FeedStore.removeChangeListener(this._onChange);
        WallStore.removeChangeListener(this._onChange);
        UserStore.removeChangeListener(this._onChange);
    },

    // Render our child components
    render: function(){
        return (
            <div>
                <Navbar />
                <Buffer />
                <SideMenu />
                <RouteHandler/>
            </div>
        );
    },

    _onChange:function(){
        console.log("something changed!");
    }

});


var Routes = (
  <Route handler={WondrousApp} path="/">
    <Route name="feed" handler={Feed}/>
    <Route name="login" handler={Login}/>
    <Route name="signup" handler={Signup}/>
    {ProfileRoute}
    <DefaultRoute handler={LoggedOut}/>
  </Route>
);


module.exports = Routes;
