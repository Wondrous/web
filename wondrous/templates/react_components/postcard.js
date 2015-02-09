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

var Postcard = React.createClass({
	render: function () {
		return (<div className="post-body round-2">
			<UserTitle name={item_owner} />
			Card</div>);
	}
});