var Wall = require('./Profile/Wall.react');
var Follower = require('./Profile/Follower.react');
var Following = require('./Profile/Following.react');
var Profile = require('./Profile/Profile.react');

var ProfileRoute = (
    <Route name="user" path="/:username" handler={Profile} ignoreScrollBehavior>
        <Route name="wall"  handler={Wall}  />
        <Route name="followers"  handler={Follower}  />
        <Route name="following"  handler={Following}  />
        <DefaultRoute handler={Wall} />
    </Route>
);

module.exports = ProfileRoute;
