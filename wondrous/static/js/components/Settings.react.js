var UserStore = require('../stores/UserStore');
var WondrousAPI = require('../utils/WondrousAPI');

var NameChange = React.createClass({
    handleData: function(err, res){
        if(err==null){
            console.log("name change",res);
        }else{

        }
    },

    handleSubmit: function(){
        WondrousAPI.changeName({
            callback: this.handleData,
            first_name: this.refs.first_name.getDOMNode().value,
            last_name: this.refs.last_name.getDOMNode().value
        });
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
                        <input type="text" ref="first_name" className="basic-input" placeholder={firstName}/>
                        <input type="text" ref="last_name" className="basic-input" placeholder={lastName}/>
                        <input type="submit" value="Save changes"/>
                    </form>
                </div>
            </div>
        );
    }
});

var UsernameChange = React.createClass({
    handleData: function(err, res){
        if(err==null){
            console.log("username change",res);
        }else{

        }
    },
    checkUsername: function(){
        console.log("should check if username is good:",this.refs.username.getDOMNode().value);
    },
    handleSubmit: function(){
        WondrousAPI.changeUsername({
            callback: this.handleData,
            username: this.refs.username.getDOMNode().value
        });
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
                        @<input type="text" ref="username" className="basic-input" onChange={this.checkUsername} placeholder="Username"/>
                        <input type="submit" value="Save changes"/>
                    </form>
                </div>
            </div>
        );
    }
});

var PasswordChange = React.createClass({
    handleData: function(err, res){
        if(err==null){
            console.log("password change",res);
        }else{

        }
    },
    handleSubmit: function(){
        if (this.refs.old1.getDOMNode().value!==this.refs.old2.getDOMNode().value){
            return;
        }
        WondrousAPI.changePassword({
            callback: this.handleData,
            old_password: this.refs.old2.getDOMNode().value,
            new_password: this.refs.new_password.getDOMNode().value
        });
    },
    render:function(){
        return (
            <div className="info-settings-item">
                <div className="info-settings-item-header">
                    <b>Change password</b>
                </div>
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <div><input type="password" ref="old1" className="basic-input" placeholder="Current password"/></div>
                        <div><input type="password" ref="old2" className="basic-input" placeholder="New password"/></div>
                        <div><input type="password" ref="new_password" className="basic-input" placeholder="Confirm new password"/></div>
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
