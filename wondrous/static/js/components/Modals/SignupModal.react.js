var ModalStore = require('../../stores/ModalStore');
var LoggedOut = require('../Home/LoggedOut.react');
var WondrousActions = require('../../actions/WondrousActions');
var ModalWrapper = require('./ModalWrapper.react');

var SignupModal = React.createClass({
    mixins:[ Reflux.connect(ModalStore) ],
    getInitialState: function(){
        return {signupOpen:false}
    },

    render: function() {
		var divStyle = {
            display : this.state.signupOpen ? "block" : "none",
            backgroundColor: "rgba(55,55,55,0.75)",
        };
		return (
            <ModalWrapper handleClose={function(evt) {
                WondrousActions.closeSignupPrompt();
        	}} divStyle={divStyle}>
                <LoggedOut/>
            </ModalWrapper>
		);
	}
});

module.exports = SignupModal;
