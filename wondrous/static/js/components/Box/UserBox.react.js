var BoxStore = require('../../stores/BoxStore');

var UserIcon = React.createClass({
    mixins: [ Router.Navigation ],

    handleClick: function(evt) {
        evt.preventDefault();
        if (typeof this.props.user.username != 'undefined') {
            this.transitionTo('/' + this.props.user.username);

        }
    },
    render: function() {
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
            return ( <UserIcon user={user}/> );
        });

        return (
            <ul className="trending-ul round-3">
                <li className="trending-li-header">UserBox #tags</li>
                {users}
            </ul>
        );
    }
});

module.exports = UserBox;
