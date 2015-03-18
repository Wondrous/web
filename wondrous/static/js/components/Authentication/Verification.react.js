var WondrousActions = require('../../actions/WondrousActions');
var WondrousAPI = require('../../utils/WondrousAPI');

var Verification = React.createClass({
    mixins: [Router.State, Router.Navigation],
    getInitialState: function(){
        return {error:null};
    },
    onVerification: function(err,res){
        if(err==null){
            WondrousActions.auth();
            this.transitionTo('/');
        }else{
            this.setState({error:err.error});
        }
    },
    componentDidMount: function(){
        var verification = this.getParams().verification;
        if (typeof verification !== 'undefined'){
            WondrousAPI.verifyUser({
                verification_code:verification,
                callback:this.onVerification
            })
        }
    },

    render: function(){
        return (
            <div>
                {this.state.error?this.state.error:null}
            </div>
        );
    }
});

module.exports = Verification;
