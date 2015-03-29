var SearchStore = require("../stores/SearchStore");
var Post = require("../components/Post/Post.react");
var UserStore = require("../stores/UserStore");
var WondrousActions = require("../actions/WondrousActions");
var MasonryMixin = require('../vendor/masonry.mixin');
var UserIcon = require('./Profile/UserIcon.react');

var masonryOptions = {
    transitionDuration: 0,
    itemSelector: ".masonry-brick",
    columnWidth: ".grid-sizer"
};

var MasonryWrapper = React.createClass({
    mixins: [MasonryMixin('masonryContainer', masonryOptions)],
    render: function(){
        return (
            <div className="masonry" ref="masonryContainer">
                <div className="grid-sizer" style={{"display": "none"}}></div>
                {this.props.children}
            </div>
        );
    }
})
var TagSearch = React.createClass({
    render: function(){
        return (
            <div>
                <h1 className="search-header">
                    Posts+Users with <b>{this.props.searchTerm}</b>
                </h1>

                <div className="grid-padding">
                    <h2 className="search-header-sub">Users</h2>
                    {this.props.users.length > 0 ?
                        <span>
                            <ul>{this.props.users}</ul>
                            {!SearchStore.doneSearchingPost && SearchStore.users.length > 0 ?
                                <Button>Load More Users</Button>
                                : null}
                        </span>
                        : null}

                    {this.props.users.length == 0 && !SearchStore.searchingPost?
                        <span>
                            <h2 style={{ color: "rgb(100,100,100)", fontSize: 20 }}>Sorry, no users were found</h2>
                        </span>
                        : null}

                    <h2 className="search-header-sub">Posts</h2>
                    {this.props.posts.length > 0 ?
                        <span>
                            <MasonryWrapper>
                                {this.props.posts}
                            </MasonryWrapper>
                            {!SearchStore.doneSearchingPost && SearchStore.posts.length > 0 ?
                                <Button>Load More Posts</Button>
                                : null}
                        </span>
                        : null}

                    {this.props.posts.length == 0 && !SearchStore.searchingPost?
                        <span>
                            <h2 style={{ color: "rgb(100,100,100)", fontSize: 20 }}>Sorry, no posts were found</h2>
                        </span>
                        : null}
                </div>
            </div>
        );
    }
});

var KWSearch = React.createClass({
    render: function(){
        return (
            <div>
                <h1 className="search-header">
                    Search results for <b>{this.props.searchTerm}</b>
                </h1>
                <div className="grid-padding">
                    <h2 className="search-header-sub">Users</h2>
                    <ul>{this.props.users}</ul>
                    {!SearchStore.doneSearchingPost && SearchStore.users.length > 0 ?
                        <Button>Load More Users</Button>
                        : null}

                    {this.props.users.length == 0 && !SearchStore.searchingPost ?
                        <span>
                            <h2 style={{ color: "rgb(100,100,100)", fontSize: 20 }}>Sorry, no users were found</h2>
                        </span>
                        : null}

                    <h2 className="search-header-sub">Posts</h2>
                    <MasonryWrapper>
                        {this.props.posts}
                    </MasonryWrapper>

                    {!SearchStore.doneSearchingPost && SearchStore.posts.length > 0 ?
                        <Button>Load More Posts</Button>
                        : null}

                    {this.props.posts.length == 0 && !SearchStore.searchingPost ?
                        <span>
                            <h2 style={{ color: "rgb(100,100,100)", fontSize: 20 }}>Sorry, no posts were found</h2>
                        </span>
                        : null}
                </div>
            </div>
        );
    }
});

var Search = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [
        Reflux.listenTo(SearchStore, 'onSearchChange')
    ],

    componentDidMount: function(){
        if (typeof this.context.router.getCurrentParams().search!=='undefined'){
            var pathArray = window.location.pathname.split( '/' );
            var isTagSearch = pathArray[1] === 'tags';
            WondrousActions.newSearch(this.context.router.getCurrentParams().search, isTagSearch);
            WondrousActions.searchLoaded();
        }else{
            this.context.router.transitionTo('/');
        }
    },

    componentWillUnmount: function(){
        //TODO probably a better way to organize this..
        $("#query").val('');
    },

    getInitialState: function() {
        return {users:[], posts:[], error:null}
    },

    onSearchChange: function(searchData){
        if(searchData.hasOwnProperty("error")) {
            this.setState({error:searchData.error})
        }

        if(searchData.hasOwnProperty("users")) {
            this.setState({users:searchData.users})
        }

        if(searchData.hasOwnProperty("posts")) {
            this.setState({posts:searchData.posts})
        }
    },
    render: function(){
        if (typeof this.context.router.getCurrentParams().search === 'undefined') {
            return (<div></div>);
        }

        var pathArray = window.location.pathname.split( '/' );
        var isTagSearch = pathArray[1] === 'tags';
        var searchTerm = this.context.router.getCurrentParams().search.replace('%20',' ');

        if (isTagSearch) {
            searchTerm = searchTerm.split(' ').map(function(word, ind) {
                return '#'+word+' '
            }).join().replace(',','');
        }

        console.log("STATE: ",this.state);
        var posts = this.state.posts.map(function(post, index) {
            console.log("post", post);
            return (
                <Post key={post.id} data={post} />
            );
        });

        var users = this.state.users.map(function(user, index){
            return (
                <UserIcon key={user.id} user={user} />
            );
        });

        return (
            <span>
                {this.state.error ? this.state.error : this.state.error}
                {isTagSearch ?
                    <TagSearch users={users} posts={posts} searchTerm={searchTerm}/>
                    :
                    <KWSearch users={users} posts={posts} searchTerm={searchTerm}/>
                }
            </span>
        );
    }
});

module.exports = Search;
