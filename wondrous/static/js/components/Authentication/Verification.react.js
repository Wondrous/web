var WondrousActions = require('../../actions/WondrousActions');
var WondrousAPI = require('../../utils/WondrousAPI');

var Verification = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    getInitialState: function(){
        return {error:null};
    },
    onVerification: function(err,res){
        if(err==null){
            WondrousActions.auth();
            this.context.router.transitionTo('/');
        }else{
            this.setState({error:err.error});
        }
    },
    componentDidMount: function(){
        var verification = this.context.router.getCurrentParams().verification;
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
