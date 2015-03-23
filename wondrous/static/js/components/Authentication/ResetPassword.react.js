var UserStore = require('../../stores/UserStore');
var WondrousAPI = require('../../utils/WondrousAPI');

var ResetPassword = React.createClass({
    mixins: [Router.Navigation, Router.State, Reflux.listenTo(UserStore,'onUserUpdate')],
    onUserUpdate: function(){
        if(UserStore.loggedIn){
            this.forceUpdate();
        }
    },
    getInitialState: function(){
        return {error:null,result:null}
    },
    onPasswordResetHandler: function(err,res){
        if(err==null){
            this.refs.header.getDOMNode().innerHTML="Password link reset sent to: "+this.refs.email.getDOMNode().value.trim();
        }else{
            this.setState({error:err.error});
        }
        this.refs.email.getDOMNode().value = '';
    },
    onPasswordReset: function(evt){
        evt.preventDefault();
        WondrousAPI.requestPasswordReset({
            email:this.refs.email.getDOMNode().value.trim(),
            callback: this.onPasswordResetHandler
        })
    },

    onRequestActivationHandler: function(err,res){
        if(err==null){
            this.refs.header.getDOMNode().innerHTML="Verification Email sent to: "+this.refs.email.getDOMNode().value.trim();
        }else{
            this.setState({error:err.error});
        }

        this.refs.email.getDOMNode().value = '';
    },

    onRequestActivation: function(evt){
        evt.preventDefault();
        WondrousAPI.requestVerification({
            email:this.refs.email.getDOMNode().value.trim(),
            callback: this.onRequestActivationHandler
        })
    },
    render: function(){
        var page = this.getParams().page

        if(UserStore.loggedIn || typeof page === 'undefined'){
            return (
                <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "5%"}}>
                <h1 ref="header" style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>You are logged in</h1>
                </div>);
        }

        var wrapperStyles = {
            margin: "0 auto",
            width: 530,
            textAlign: "left",
        }

        var inputStyles = {
            width: "80%",
        }

        if (page === 'password') {
            return (
                <div className="loggedout-wrapper" style={wrapperStyles}>
                    <h1 ref="header" className="loggedout-header">So you forgot something important ;)</h1>
                    <form onSubmit={this.onPasswordReset}>
                        <div>
                            <input className="input-basic round-3" style={inputStyles} type="email" ref="email" placeholder="Email" />
                        </div>
                        <div className="loggedout-error">
                            {this.state.error ? this.state.error : null}
                        </div>
                        <div>
                            <input className="input-basic loggedout-login-btn round-15" type="submit" ref="signup_button" value="Send Password Reset"/>
                        </div>
                    </form>
                </div>
            );
        } else if (page === 'activate') {
            return (
                <div className="loggedout-wrapper" style={wrapperStyles}>
                    <h1 ref="header" className="loggedout-header">Need to activate your account?</h1>
                    <form onSubmit={this.onRequestActivation}>
                        <div>
                            <input className="input-basic round-3" style={inputStyles} type="email" ref="email" placeholder="Email" />
                        </div>
                        <div className="loggedout-error">
                            {this.state.error ? this.state.error : null}
                        </div>
                        <div>
                            <input className="input-basic loggedout-login-btn round-15" type="submit" ref="signup_button" value="Send verification email"/>
                        </div>
                    </form>
                </div>
            );
        }
    }
});


module.exports = ResetPassword
