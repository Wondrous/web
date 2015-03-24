var BoxStore = require('../../stores/BoxStore');

var UserIcon = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    handleClick: function(evt) {
        evt.preventDefault();
        if (typeof this.props.user.username != 'undefined') {
            this.context.router.transitionTo('/' + this.props.user.username);

        }
    },
    render: function() {

        var userItemizerStyleOverrides = {
            padding: "10px 5px",
            borderTop: "1px solid rgb(240,240,240)",
        }

        var avatarStyleOverrides = {
            overflow: "visible",
        }

        var profilePhotoStyleOverrides = {
            height: 40,
            width: 40,
            verticalAlign: "middle",
        }

        var userItemizerDataStyleOverrides = {
            fontSize: 13,
            maxWidth: 190,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
        }

        return (
            <li className="user-itemizer" style={userItemizerStyleOverrides}>
                <a className="avatar" style={avatarStyleOverrides} onClick={this.handleClick}>
                    <img className="profile-photo-med round-50" style={profilePhotoStyleOverrides} src={(typeof this.props.user.ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/" + this.props.user.ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg"} />
                </a>
                <div className="user-itemizer-data" style={userItemizerDataStyleOverrides}>
                    <a className="user-itemizer-data-name" onClick={this.handleClick} >{ this.props.user.name }</a>
                    <div className="user-itemizer-data-desc">
                        @{ this.props.user.username }
                    </div>
                </div>
            </li>
        );
    }
});

var UserBox = React.createClass({
    mixins: [Reflux.listenTo(BoxStore, "onBoxChange")],

    componentDidMount: function() {
    },

    getInitialState: function() {
        return {users: BoxStore.users}
    },

    onBoxChange: function() {
        this.setState({users: BoxStore.users});
    },

    render: function() {
        var users = this.state.users.map(function(user, ind) {
            return ( <UserIcon user={user} key={user.id}/> );
        });

        return (
            <ul className="trending-ul round-3">
                <li className="trending-li-header" style={{ border: "none" }}>
                    Users who you might like
                </li>
                {users}
            </ul>
        );
    }
});

module.exports = UserBox;
