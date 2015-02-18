
$(document).ready(function() {
    var pathArray = window.location.pathname.split( '/' );
    var username = pathArray[1];

    var Feed = React.createClass({
        page:0,
        loadFeedFromServer: function(){
            console.log("/api/wall?username="+username+"&page="+String(this.page));
            $.ajax({
                type: "GET",
                dataType: 'json',
                url: "/api/wall?username="+username+"&page="+String(this.page),
                success: function(data) {
                    console.log("wall",data);
                    this.setState({data: data});
                }.bind(this),
                error: function(xhr,status,err){
                    console.error("get feed err",status,err.toString());
                }.bind(this)
            });
        },
        getInitialState: function() {
            return {data: []};
        },
        componentDidMount: function() {
            this.loadFeedFromServer();
        },
        render: function() {
            var posts = this.state.data.map(function(post,index){
                return(
                    <Post data={post}/>
                );
            });
            return (
              <div className="masonry" id="asyncPosts">
                {posts}
              </div>
            );
        }
    });

    var UserBar = React.createClass({
        getInitialState: function() {
            return {data: []};
        },
        componentDidMount: function() {
            this.loadUserFromServer();
        },
        loadUserFromServer: function(){
            $.ajax({
                type: "GET",
                dataType: 'json',
                url: "/api/user?username="+username,
                success: function(data) {
                    console.log("profile view",data);
                    this.setState({data: data});
                }.bind(this),
                error: function(xhr,status,err){
                    console.error("get user info err",status,err.toString());
                }.bind(this)
            });
        },
        render: function(){
            return (
                <div className="profile-header">
                    <img src="/static/pictures/defaults/p.default-profile-picture.jpg" className="profile-photo round-50"/>

                    <span className="profile-header-content">
                        <span className="profile-name">{this.state.data.name}</span>
                        <span className="profile-wscore">
                            <span className="profile-wscore-text round-5">1</span>
                        </span>

                    </span>

                    <span className="profile-header-nav">
                        <a className="profile-header-nav-link current-tab" href={"/"+this.state.data.username}>Posts</a>
                        <a className="profile-header-nav-link " href="/user1/followers/">Followers</a>
                        <a className="profile-header-nav-link " href="/user1/following/">Following</a>
                        <a className="profile-header-nav-link " href="/user1/likes/">l!kes</a>
                    </span>
                </div>
            );
        }
    });



    var Compound = React.createClass({
        render: function () {
            return (
                <div className="main-content">
                    <Navbar user={this.props.data}/>
                    <UserBar />
                    <PostForm />
                    <div className="cover profile-content">
                        <Feed />
                    </div>
                    <script src="/static/js/masonry/masonry.pkgd.min.js"></script>
                    <script type="text/jsx" src="/static/js/masonry.js"></script>
                </div>);
        }
    });


    React.render(<Compound />, document.body);

    // console.log("lol",pathArray);

});
