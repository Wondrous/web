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
var Home = require('./Feed.react');
var Login = require('../components/Authenticate.react').Login;
var Navbar = require('./Navbar.react');
var ProfileRoute = require('./Profile.react');
var PostModal = require('./PostModal.react');
var Settings = require('../components/Settings.react');
var SideMenu = require('../components/SideMenu.react');
var Search = require('../components/Search.react');
var Signup = require('../components/Authenticate.react').Signup;
var LandingApp = require('./Landing.react');

var WondrousApp = React.createClass({
    checkWindowScroll: function(){
        // Get scroll pos & window data
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var s = $(document).scrollTop();
        var scrolled = (s) > document.body.offsetHeight;
        if (scrolled){

        }
        // If scrolled enough, not currently paging and not complete...
        // if(scrolled && !FeedStore.paging && !FeedStore.donePaging) {
        //     FeedStore.paging = true;
        //     console.log("getting more page")
        //     FeedStore.incrementPage();
        //     WondrousActions.loadFeed(FeedStore.current_page);
        // }
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
                <PostModal />
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
        <Route name="search" path="/search/:search" handler={Search}/>
        <Route name="post" path="/post/:post_id" handler={Home}/>
        <Route name="settings" path="/settings/" handler={Settings}/>
        {ProfileRoute}
        <DefaultRoute name="default" handler={Home}/>
    </Route>
);

module.exports = Routes;
