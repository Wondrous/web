
$(document).ready(function() {
    var Feed = React.createClass({
        user_id:$('#userID').val(),
        page:0,
        loadFeedFromServer: function(){
            console.log("/api/wall?user_id="+this.user_id+"&page="+String(this.page));
            $.ajax({
                type: "GET",
                dataType: 'json',
                url: "/api/wall?user_id="+this.user_id+"&page="+String(this.page),
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
                {posts}
              </div>
            );
        }
    });

    var UserBar = React.createClass({
        user_id:$('#userID').val(),
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
                url: "/api/user?user_id="+String(this.user_id),
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
                        <a className="profile-header-nav-link current-tab" href="/user1/">Posts</a>
                        <a className="profile-header-nav-link " href="/user1/followers/">Followers</a>
                        <a className="profile-header-nav-link " href="/user1/following/">Following</a>
                        <a className="profile-header-nav-link " href="/user1/likes/">l!kes</a>
                    </span>
                </div>
            );
        }
    });

    var PostForm = React.createClass({
        render: function(){
            return (
                <div>
                    <div id="new-post-launch" className="round-2">Make a new post</div>
                    <div id="new-post-dialogue" className="new-post-wrapper round-3" style={{"width":"530px"}}>
                        <img id="cropBox" src="/static/pictures/500x500.gif"/>

                        <div className="new-post-element">
                            <div style={{"position":"relative", "margin":"0 auto", "marginBottom":"-1px"}}>
                                <input id="postSubject" className="new-post-subject" maxLength="45" placeholder="Add a title!" spellCheck="False"/>
                            </div>
                        </div>

                        <div className="new-post-element" style={{"backgroundColor": "rgb(255,255,255)"}}>
                            <div className="post-input-wrapper">
                                <div className="highlighter"></div>
                                <div className="typehead">
                                    <textarea id="postTextarea" maxLength="5000" placeholder="Write something. Post a link. Add #hashtags." className="post-input"
                                    style={{"overflow": "hidden", "wordWrap": "break-word", "resize": "none", "height": "48px"}}></textarea>
                                </div>
                            </div>
                        </div>

                        <div id="post-hashtags"></div>
                        <div id="postUploadBtn" className="upload-button round-2 fileinput-button">
                            Upload a photo
                            <input id="fileuploadPostImage" type="file" name="files[]"/>
                        </div>

                        <div id="progress" className="small-red-bar fileinput-button progress post-dialogue-progress">
                            <div className="progress-bar progress-bar-success" style={{"textAlign": "center"}}></div>
                        </div>

                        <div id="filename"></div>
                        <div id="uploadedImagePreviewWrapper"></div>
                        <input id="objectFileID" type="hidden" value=""/>

                        <div id="post-upload-file" className="files" style={{"postion": "relative","marginLeft": "5px","fontSize":"14px"}}></div>

                        <div className="post-error-wrapper">
                            <span className="post-error"></span>
                        </div>

                        <div id="post-button" role="button" className="post-button round-3">Share</div>
                        <div role="button" className="post-button round-3 cancel-post-button">Cancel</div>
                    </div>
                </div>
            );
        },

    	componentDidMount: function () {
    		// Example of how to write the actions that
    		// will occur after React renders the item.
    		initSmartTextarea();
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
                </div>);
        }
    });


    React.render(<Compound />, document.body);
    // var pathArray = window.location.pathname.split( '/' );
    //
    // var secondLevelLocation = pathArray[0];
    // console.log("lol",pathArray);

});
