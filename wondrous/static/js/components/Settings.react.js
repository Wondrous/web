var UserStore = require('../stores/UserStore');
var WondrousAPI = require('../utils/WondrousAPI');

var NameChange = React.createClass({
    handleSubmit: function(){

    },
    render:function(){
        var firstName = this.props.user.first_name;
        var lastName = this.props.user.last_name;
        var name = this.props.user.name;
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Change Name:</b> {name}
                </div>
                <div>
                    <div className="info-settings-item-body-desc">
                        Note: You can only change your name a very limited number of times.
                    </div>
                    <form onSubmit={this.handleSubmit}>
                        <input type="text" ref="firstName" className="basic-input" placeholder="First name" value={firstName}/>
                        <input type="text" ref="lastName" className="basic-input" placeholder="Last name" value={lastName}/>
                        <input type="submit" value="Save changes"/>
                    </form>
                </div>
            </div>
        );
    }
});

var UsernameChange = React.createClass({
    handleSubmit: function(){

    },
    render:function(){
        var username = this.props.user.username;
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Change Username:</b> @{username}, www.wondrous.co/<b>{username}</b>/
                </div>
                <div>
                    <form onSubmit={this.handleSubmit}>
                        @<input type="text" className="basic-input" placeholder="Username" value={username}/>
                        <input type="submit" value="Save changes"/>
                    </form>
                </div>
            </div>
        );
    }
});

var PasswordChange = React.createClass({
    handleSubmit: function(){

    },
    render:function(){
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Change password</b>
                </div>
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <div><input type="password" className="basic-input" placeholder="Current password"/></div>
                        <div><input type="password" className="basic-input" placeholder="New password"/></div>
                        <div><input type="password" className="basic-input" placeholder="Confirm new password"/></div>
                        <div><input type="submit" value="Save changes"/></div>
                    </form>
                </div>
            </div>
        );
    }
});

var VisibilityChange = React.createClass({
    handleData:function(err,res){
        if(!err){
            this.props.user.is_private = res.is_private;
            this.forceUpdate();
        }else{
            console.error('err',err)
        }
    },
    toggleVisibility: function(){
        WondrousAPI.toggleVisibility({
            callback:this.handleData
        })
    },
    render:function(){
        var is_private = this.props.user.is_private;
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Profile visibility</b>
                </div>
                <div>
                    Posts are private
                   <button onClick={this.toggleVisibility} className="privacy-toggle ">{is_private?"on":"off"}</button>
                </div>
            </div>
        );
    }
});

var ActiveChange = React.createClass({
    handleDeletion:function(){

    },
    render:function(){
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Deactivate my account</b>
                </div>
                <div>
                    <a onClick={this.handleDeletion}>I would like to delete my account</a>
                </div>
            </div>
        );
    }
});

function getUserState(){
    var data = UserStore.getUserData();
    data.loggedin = UserStore.isUserLoggedIn();
    return {data:data};
}

var Settings = React.createClass({
    getInitialState: function() {
        return getUserState();
    },
    componentDidMount: function() {
        UserStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function(){
        UserStore.removeChangeListener(this._onChange);
    },
    render:function(){
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
    _onChange:function(){
        this.setState(getUserState());
    }
});

module.exports = Settings;
