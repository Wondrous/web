var item_owner = {
	"profile_picture": 1,
	"username": "boobyBelch",
	"person": {"name" : "Bob Belcher"}
}

var UserTitle = React.createClass({
	render: function () {
		var user = this.props.name;
		return (
			<div>
				<img className="post-thumb round-50" src={user.profile_picture} />
				<span className="post-identifier ellipsis-overflow">
				    <a href="/static ">{user.person.name}</a>
				</span>
			</div>);
	}
});
/*
var Postcard = React.createClass({
	render: function () {
		return (<div className="post-body round-2">
			<UserTitle name={item_owner} />
			Card</div>);
	}
});
*/
var Photo = React.createClass({
	render: function () {
		return (
			<div className="post-cover-photo cover no-top-border" 
			style={{"background-image": "url(http://static.boredpanda.com/blog/wp-content/uploads/2014/09/20-Dogs-That-Look-Like-Something-Else13__300.jpg)"}}>
				<div className="post-subject-text">
                    <div className="post-subject-wrapper">
                        <div className="post-subject-text-position">
                            HOOD RICH
                        </div>
                    </div>
                </div>
			</div>);
	}
})
var Postcard = React.createClass({
	render: function () {
		return (
			<div className="masonry-brick">
				<div className="post-body round-2">
					<input className="objectID" type="hidden" value="7" />
					<UserTitle name={item_owner} />
					<Photo />
					CARD 
				</div>
			</div>)
	}
})


/*                
                <div class="post-cover-photo cover no-top-border" style="background-image: url(http://static.boredpanda.com/blog/wp-content/uploads/2014/09/20-Dogs-That-Look-Like-Something-Else13__300.jpg);">

                
                    <div class="post-subject-text">
                        <div class="post-subject-wrapper">
                            <div class="post-subject-text-position">
                                
                                    HOOD RICH
                                
                            </div>
                        </div>
                    </div>
                </div>
                <div class="post-content" style="display: none;">
                    ISHA BOI
                    <hr style="width: 60%;">
                    <div>
                        <span class="post-footer-btn post-like-btn round-2">Like!</span>
                        <span class="post-footer-btn post-repost-btn round-2">Repost</span>
                    </div>
<!--                     <div>
                        <input type="text" placeholder="What're your thoughts?">
                    </div> -->
                </div>
            </div>
        </div>


*/