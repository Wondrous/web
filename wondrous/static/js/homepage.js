
$(document).ready(function() {
    var unloadedUser = {name:"TEMP",username:"TEMP"};
    var Feed = React.createClass({
        page:0,
        loadFeedFromServer: function(){
                $.ajax({
                type: "GET",
                dataType: 'json',
                url: "/api/feed?feed_type=0&page="+String(this.page),
                success: function(data) {
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
                <h1>feed</h1>
                {posts}
              </div>
            );
        }
    });

    var MainContent = React.createClass({
        render: function(){
            return(
                <div className="main-content">
                    <div style={{"padding": "20px"}}>
                        <a href="/" className="tab nh tab-current">
                            <span className="tab-text">Majority</span>
                        </a>

                        <a href="/priority-feed/" className="tab nh ">
                            <span className="tab-text">Priority</span>
                        </a>
                    </div>
                    <div className="cover profile-content">
                    <h2>Majority Feed</h2>
                    <Feed />
                    </div>
                </div>);
        }
    });

    var Compound = React.createClass({
        render: function () {
            return (
                <div>
                    <Navbar />
                    <Buffer />
                    <MainContent />
                </div>);
        }
    });


    React.render(<Compound />, document.body);
});
