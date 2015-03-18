var DefaultRoute = require('react-router').DefaultRoute;
var React = require('react');
var Route = require('react-router').Route;
var RouteHandler = require('react-router').RouteHandler;

// Stores
var FeedStore = require('../stores/FeedStore');
var ProfileStore = require('../stores/ProfileStore');
var UserStore = require('../stores/UserStore');
var WallStore = require('../stores/WallStore');
var SettingStore = require('../stores/SettingStore');

// Other components -- stitch them together
var Buffer = require('./Buffer.react');
var Home = require('./Feed.react').Home;
var LoggedOut = require('./Feed.react').LoggedOut;
var Navbar = require('./Navbar.react');
var ProfileRoute = require('./Profile.react');
var ModalContainer = require('./ModalContainer.react');
var Settings = require('../components/Settings.react');
var SideMenu = require('../components/SideMenu.react');
var Search = require('../components/Search.react');
var Login = require('../components/Authenticate.react').Login;
var Signup = require('../components/Authenticate.react').Signup;
var ResetPage = require('../components/Authenticate.react').ResetPage;
var VerificationPage = require('../components/Authenticate.react').VerificationPage;
var PasswordResetPage = require('../components/Authenticate.react').PasswordResetPage;
var LandingApp = require('./Landing.react');

var WondrousConstants = require('../constants/WondrousConstants');
var WondrousActions = require('../actions/WondrousActions');


var WondrousApp = React.createClass({
    checkWindowScroll: function(){
        // Get scroll pos & window data
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var s = $(document).scrollTop();
        var scrolled = (s+2*h) > document.body.offsetHeight;
        if (scrolled){
            if(SettingStore.pageType == WondrousConstants.PROFILE_PAGE){
                WallStore.loadMore();
            }else if(SettingStore.pageType == WondrousConstants.FEED_PAGE){
                FeedStore.loadMore();
            }
        }
    },

    componentDidMount: function(){
        window.addEventListener('scroll', this.checkWindowScroll);
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
                <ModalContainer />
            </div>
        );
    },
});

var Routes = (
    <Route handler={WondrousApp} path="/">
        <Route name="landingBare" path="/landing" handler={LandingApp}/>
        <Route name="landing" path="/refer/:ref_uuid" handler={LandingApp}/>
        <Route name="progress" path="/progress/:uuid" handler={LandingApp}/>
        <Route name="login" path="/login" handler={Login}/>
        <Route name="signup" path="/signup" handler={Signup}/>
        <Route name="signupEarly" path="/signup/:verification_code" handler={Signup}/>
        <Route name="resetRequest" path="/reset_request/:page" handler={ResetPage}/>
        <Route name="search" path="/search/:search" handler={Search} ignoreScrollBehavior/>
        <Route name="post" path="/post/:post_id" handler={Home}/>
        <Route name="activate" path="/activate/:verification" handler={VerificationPage}/>
        <Route name="passwordReset" path="/reset/:verification" handler={PasswordResetPage}/>
        <Route name="settings" path="/settings" handler={Settings}/>
        {ProfileRoute}
        <DefaultRoute name="default" handler={Home}/>
    </Route>
);

module.exports = Routes;
