var WondrousAPI = require('../../utils/WondrousAPI');
var UserStore = require('../../stores/UserStore');

var PasswordReset = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    getInitialState: function(){
        return {error:null};
    },
    onPasswordReset: function(err,res){
        if(err==null){
            this.refs.passwordConfirm.getDOMNode().value = this.refs.password.getDOMNode().value = '';
            this.context.router.transitionTo('/login');
        }else{
            this.setState({error:err.error});
        }
    },

    onSubmitReset: function(evt){
        evt.preventDefault();
        this.setState({error:null});
        if (this.refs.password.getDOMNode().value!==this.refs.passwordConfirm.getDOMNode().value){
            this.setState({error:'your passwords do not match :('})
        }else{
            var verification = this.context.router.getCurrentParams().verification;
            if (typeof verification !== 'undefined'){
                WondrousAPI.passwordReset({
                    verification_code:verification,
                    password:this.refs.passwordConfirm.getDOMNode().value.trim(),
                    callback:this.onPasswordReset
                });
            }
        }
    },

    render: function(){
        if(UserStore.loggedIn){
            return (
                <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "5%"}}>
                <h1 ref="header" style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>You are logged in</h1>
                </div>);
        }

        return (
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "10%"}}>
                <h1 style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>Password Reset</h1>
                <form method="POST" onSubmit={this.onSubmitReset}>
                    <div>
                        <input className="input-basic round-3" type="password" ref="password" placeholder="New Password" />
                    </div>
                    <div>
                        <input className="input-basic round-3" type="password" ref="passwordConfirm" placeholder="Confirm Password" />
                    </div>

                    <div>
                        <input className="input-basic round-3" type="submit" value="Reset" />
                    </div>
                </form>
                {this.state.error?this.state.error:null}
            </div>
        );
    }
});

module.exports = PasswordReset;
