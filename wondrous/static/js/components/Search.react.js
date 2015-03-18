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
    mixins: [Router.State, Reflux.listenTo(SearchStore,'onSearchChange')],
    componentWillMount: function(){
        WondrousActions.newSearch(this.getParams().search);
    },
    componentWillUnmount: function(){
        //TODO probably a better way to organize this..
        $("#query").val('');
    },
    getInitialState: function() {
        return {users:[],posts:[],error:null}
    },
    onSearchChange: function(searchData){
        if(searchData.hasOwnProperty("error")) {
            this.setState({error:searchData.error})
        }

        if(searchData.hasOwnProperty("users")) {
            console.log("names",searchData);
            this.setState({users:searchData.users})
        }

        if(searchData.hasOwnProperty("posts")) {
            this.setState({posts:searchData.posts})
        }
    },
    render: function(){
        console.log("props",this.props);
        var posts = this.state.posts.map(function(post, index) {
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
            <div className="search-result">
                {this.state.error ? this.state.error : this.state.error}
                <ul>{users}</ul>
                <div>{posts}</div>
            </div>
        );
    }
});

module.exports = Search;
