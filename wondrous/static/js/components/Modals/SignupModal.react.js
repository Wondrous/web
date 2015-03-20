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
		divStyle = ModalStore.signupOpen?{display:"block"} : {display:"none"};
		return (
            <ModalWrapper handleClose={this.handleClose} divStyle={divStyle}>
                <LoggedOut/>
            </ModalWrapper>
		);
	}
});

module.exports = SignupModal;
