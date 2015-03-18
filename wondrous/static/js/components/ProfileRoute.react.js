var Wall = require('./Profile/Wall.react');
var Follower = require('./Profile/Follower.react');
var Following = require('./Profile/Following.react');
var Profile = require('./Profile/Profile.react');

var ProfileRoute = (
    <Route name="user" path="/:username" handler={Profile} ignoreScrollBehavior>
        <Route name="wall" path="/:username/wall" handler={Wall}  />
        <Route name="followers" path="/:username/followers" handler={Follower}  />
        <Route name="following" path="/:username/following" handler={Following}  />
        <DefaultRoute handler={Wall} />
    </Route>
);

module.exports = ProfileRoute;
