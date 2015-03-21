var SearchStore = require("../stores/SearchStore");
var Post = require("../components/Post/Post.react");
var UserStore = require("../stores/UserStore");
var WondrousActions = require("../actions/WondrousActions");

var UserIcon = React.createClass({
    mixins: [ Router.Navigation ],

    handleClick: function(evt) {
        evt.preventDefault();
        if (typeof this.props.user.username != 'undefined') {
            this.transitionTo('/' + this.props.user.username);

        }
    },
    render: function() {
        var is_me = this.props.user.username === UserStore.user.username;
        return (
            <li className="user-itemizer">
                <a className="avatar" onClick={this.handleClick}>
                    <img className="profile-photo-med round-50" src={(typeof this.props.user.ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/" + this.props.user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg"} />
                </a>
                <div className="user-itemizer-data">
                    <a className="user-itemizer-data-name" onClick={this.handleClick} >{ this.props.user.name }</a>
                    <div className="user-itemizer-data-desc">
                        @{ this.props.user.username }
                    </div>
                </div>
            </li>
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
            <div className="grid-padding">
                {this.state.error ? this.state.error : this.state.error}
                {isTagSearch ?
                    <div>
                        <h1>Tag Search results for {searchTerm}</h1>
                        <h1>Posts go here</h1>
                        <div className="masonry">{posts}</div>
                        {!SearchStore.doneSearchingPost && SearchStore.posts.length > 0 ? <Button>Load More Posts</Button> : null}
                    </div>
                    :
                    <div>
                        <h1>Search results for {searchTerm}</h1>
                        <h1>Users go here</h1>
                        <ul>{users}</ul>
                        {!SearchStore.doneSearchingPost && SearchStore.users.length > 0 ? <Button>Load More Users</Button> : null}

                        <h1>Posts go here</h1>
                        <div className="masonry">{posts}</div>
                        {!SearchStore.doneSearchingPost && SearchStore.posts.length > 0 ? <Button>Load More Posts</Button> : null}
                    </div>
                }
            </div>
        );
    }
});

module.exports = Search;
