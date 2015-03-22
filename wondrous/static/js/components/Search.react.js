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
                    Posts with <b>{this.props.searchTerm}</b>
                </h1>

                <div className="grid-padding">
                    {this.props.users.length > 0 ?
                        <span>
                            <h2 className="search-header-sub">Users</h2>
                            <ul>{this.props.users}</ul>
                            {!SearchStore.doneSearchingPost && SearchStore.users.length > 0 ?
                                <Button>Load More Users</Button>
                                : null}
                        </span>
                        : null}

                    {this.props.posts.length > 0 ?
                        <span>
                            <h2 className="search-header-sub">Posts</h2>
                            <MasonryWrapper>
                                {this.props.posts}
                            </MasonryWrapper>
                            {!SearchStore.doneSearchingPost && SearchStore.posts.length > 0 ?
                                <Button>Load More Posts</Button>
                                : null}
                        </span>
                        :null}
                    {this.props.posts.length == 0 && !SearchStore.searchingPost?
                        <span>
                            <h2>Sorry, no posts were found :(</h2>
                        </span>
                        :null}
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

                    <h2 className="search-header-sub">Posts</h2>
                    <MasonryWrapper>
                        {this.props.posts}
                    </MasonryWrapper>

                    {!SearchStore.doneSearchingPost && SearchStore.posts.length > 0 ?
                        <Button>Load More Posts</Button>
                        : null}
                </div>
            </div>
        );
    }
});

var Search = React.createClass({
    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(SearchStore, 'onSearchChange')
    ],

    componentDidMount: function(){
        if (typeof this.getParams().search!=='undefined'){
            var pathArray = window.location.pathname.split( '/' );
            var isTagSearch = pathArray[1] === 'tags';
            WondrousActions.newSearch(this.getParams().search, isTagSearch);
            WondrousActions.searchLoaded();
        }else{
            this.transitionTo('/');
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
        if (typeof this.getParams().search === 'undefined') {
            return (<div></div>);
        }

        var pathArray = window.location.pathname.split( '/' );
        var isTagSearch = pathArray[1] === 'tags';
        var searchTerm = this.getParams().search.replace('%20',' ');

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
