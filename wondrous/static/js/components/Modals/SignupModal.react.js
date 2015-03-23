var ModalStore = require('../../stores/ModalStore');
var LoggedOut = require('../Home/LoggedOut.react');
var WondrousActions = require('../../actions/WondrousActions');
var ModalWrapper = require('./ModalWrapper.react');

var SignupModal = React.createClass({
    mixins:[ Reflux.listenTo(ModalStore,"onModalChange") ],

    onModalChange: function() {
        this.forceUpdate();
    },

    handleClose: function(evt) {
        WondrousActions.closeSignupPrompt();
	},

    render: function() {
		var divStyle = {
            display : ModalStore.signupOpen ? "block" : "none",
            backgroundColor: "rgba(55,55,55,0.75)",
        };
		return (
            <ModalWrapper handleClose={this.handleClose} divStyle={divStyle}>
                <LoggedOut/>
            </ModalWrapper>
		);
	}
});

module.exports = SignupModal;
