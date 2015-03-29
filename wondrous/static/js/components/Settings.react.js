var UserStore = require('../stores/UserStore');
var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');

var NameChange = React.createClass({
    getInitialState: function(){
        return {'error':null};
    },
    handleData: function(err, res) {
        if (err == null) {
            this.setState({error:null});
            WondrousActions.updateUser(res);
        } else {
            this.setState({error:err.error});
        }
    },

    handleSubmit: function(evt){
        evt.preventDefault();
        WondrousAPI.changeName({
            callback: this.handleData,
            name: this.refs.name.getDOMNode().value,
        });
    },
    render:function(){
        var name = this.props.user.name;
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Change Name:</b> {name}
                </div>
                <div className="info-settings-item-content">
                    <div className="info-settings-item-body-desc">
                        Note: You can only change your name a very limited number of times.
                    </div>
                    <form onSubmit={this.handleSubmit}>
                        <input type="text" ref="name" className="basic-input" placeholder={name}/>
                        <input type="submit" value="Save changes"/>
                    </form>
                </div>
                <div>
                    {this.state.error!=null?<b>Error: {this.state.error}</b>:null}
                </div>
            </div>
        );
    }
});

var UsernameChange = React.createClass({
    getInitialState: function(){
        return {'error':null};
    },
    handleData: function(err, res){
        if (err == null) {
            this.setState({error:null});
            WondrousActions.updateUser(res);
        } else {
            this.setState({error:err.error});
        }
    },
    // checkUsername: function() {
    //     console.log("should check if username is good:", this.refs.username.getDOMNode().value);
    // },
    handleSubmit: function(evt) {
        evt.preventDefault();
        WondrousAPI.changeUsername({
            callback: this.handleData,
            username: this.refs.username.getDOMNode().value
        });
    },
    render:function() {
        var username = this.props.user.username;
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Change Username:</b> @{username}, www.wondrous.co/<b>{username}</b>
                </div>
                <div className="info-settings-item-content">
                    <form onSubmit={this.handleSubmit}>
                        @<input type="text" ref="username" className="basic-input" placeholder="Username"/>
                        <input type="submit" value="Save changes"/>
                    </form>
                </div>
                <div>
                    {this.state.error!=null?<b>Error: {this.state.error}</b>:null}
                </div>
            </div>
        );
    }
});

var PasswordChange = React.createClass({
    getInitialState: function(){
        return {'error':null};
    },
    handleData: function(err, res) {
        if (err == null) {
            this.setState({error:null});
            WondrousActions.updateUser(res);
        } else {
            this.setState({error:err.error});
        }
    },
    handleSubmit: function(evt) {
        evt.preventDefault();
        if (this.refs.new_password.getDOMNode().value !== this.refs.new_password_confirm.getDOMNode().value) {
            this.setState({error:"passwords do not match!"});
            return;
        }
        WondrousAPI.changePassword({
            callback: this.handleData,
            old_password: this.refs.old_password.getDOMNode().value,
            new_password: this.refs.new_password.getDOMNode().value
        });
    },
    render:function() {
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Change password</b>
                </div>
                <div className="info-settings-item-content">
                    <form onSubmit={this.handleSubmit}>
                        <div><input type="password" ref="old_password" className="basic-input" placeholder="Current password"/></div>
                        <div><input type="password" ref="new_password" className="basic-input" placeholder="New password"/></div>
                        <div><input type="password" ref="new_password_confirm" className="basic-input" placeholder="Confirm new password"/></div>
                        <div className="loggedout-error">
                            {this.state.error!=null?<b>Error: {this.state.error}</b>:null}
                        </div>
                        <div><input type="submit" value="Save changes"/></div>
                    </form>
                </div>
            </div>
        );
    }
});

var VisibilityChange = React.createClass({
    getInitialState: function(){
        return {'error':null};
    },
    handleData: function(err,res){
        if (!err) {
            this.setState({error:null});
            this.props.user.is_private = res.is_private;
            this.forceUpdate();
        } else {
            this.setState({error:err.error});
        }
    },
    toggleVisibility: function(){
        WondrousAPI.toggleVisibility({
            callback:this.handleData
        })
    },
    render: function() {
        var is_private = this.props.user.is_private;
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Profile visibility</b>
                </div>
                <div className="info-settings-item-content">
                    Posts are private
                    <button onClick={this.toggleVisibility} className="privacy-toggle">{is_private?"on":"off"}</button>
                </div>
                <div>
                    {this.state.error!=null?<b>Error: {this.state.error}</b>:null}
                </div>
            </div>
        );
    }
});

var ActiveChange = React.createClass({
    handleDeletion: function() {

    },
    render:function() {
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Deactivate my account</b>
                </div>
                <div className="info-settings-item-content">
                    <a onClick={this.handleDeletion}>I would like to delete my account</a>
                </div>
            </div>
        );
    }
});

function getUserState() {
    var data = UserStore.user;
    data.loggedin = UserStore.loggedIn;
    return {data:data};
}

var Settings = React.createClass({
    mixins: [Reflux.listenTo(UserStore,"onUserChange")],
    
    getInitialState: function() {
        return getUserState();
    },

    render: function() {
        return (
            <div className="info-content" style={{"paddingTop": "10px"}}>
                <h1 className="info-h1">Account Settings</h1>
                <NameChange user={this.state.data}/>
                <hr/>
                <UsernameChange user={this.state.data}/>
                <hr/>
                <PasswordChange user={this.state.data}/>
                <hr/>
                <VisibilityChange user={this.state.data}/>
                <hr/>
                <ActiveChange user={this.state.data}/>
            </div>
        );
    },

    onUserChange: function(userData) {

        if(userData.hasOwnProperty('user')){
            this.setState(getUserState());
        }
    },

    componentDidMount: function() {
        var SPEED = 175;
        $(document).on("click", ".info-settings-item-header", function() {
            var thisItemContent = $(this).siblings(".info-settings-item-content");
            $(".info-settings-item-content").not(thisItemContent).slideUp(SPEED);
            thisItemContent.slideToggle(SPEED);
        });
    }
});

module.exports = Settings;
