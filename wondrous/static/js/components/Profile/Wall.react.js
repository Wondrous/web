var MasonryMixin = require('../../vendor/masonry.mixin');
var WallStore = require('../../stores/WallStore');
var WondrousActions = require('../../actions/WondrousActions');
var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');
var Post = require('../Post/Post.react');
var checkLogin = require('../../utils/Func').checkLogin;

var masonryOptions = {
    transitionDuration: 0,
    itemSelector: ".masonry-brick",
    columnWidth: ".grid-sizer"
};

var Wall = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    mixins: [
        MasonryMixin('masonryContainer', masonryOptions),
        Reflux.connect(WallStore,"data")
    ],

    componentDidMount: function(){
        WondrousActions.wallLoaded();
    },

    getInitialState: function() {
        return {data:WallStore.getWall()};
    },

    render: function() {
        var am_following = ProfileStore.user.following;
        var is_private = ProfileStore.user.is_private;
        var is_visible = am_following || is_private;
        is_visible = is_visible === true;

        var posts = this.state.data.map(function(post,index){
            return(
                <Post key={post.id} data={post} />
            );
        });
        var username = this.context.router.getCurrentParams().username;
        var is_me = username === UserStore.user.username;
        var noData = posts.length == 0;

        var bottomBar = null;
        if(!UserStore.loggedIn&&UserStore.loaded){
            bottomBar = <div onClick={checkLogin}>Sign Up for more</div>
        }else if(!WallStore.donePaging && posts.length > 0){
            bottomBar = <img className="loading-wheel" src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/p.loading.gif"/>;
        }

        return (
            <div>
                {is_me ?
                    <div onClick={function(e){WondrousActions.openPostModal();}} id="new-post-launch" className="round-50" title="Create a new post on your wall">
                        <img className="post-general-icon new-post-launch-icon" src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/icons/newpost/newpost_green.svg" />
                    </div>
                    : null
                }

                <div className="masonry" ref="masonryContainer" id="asyncPosts">
                <div className="grid-sizer" style={{  display: "none" }}></div>
                    {posts}
                    {noData ?
                        <div className="no-data-to-display">
                            {is_me ?
                                "You haven't posted anything yet"
                                :
                                "This user hasn't posted anything yet"
                            }
                        </div>
                        : null }
                </div>
                <div>
                    {bottomBar}
                </div>
            </div>
        );
    }
});


module.exports = Wall;
