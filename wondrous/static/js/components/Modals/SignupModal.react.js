var ModalStore = require('../../stores/ModalStore');
var LoggedOut = require('../Feed.react').LoggedOut;

var SignupModal = React.createClass({
    mixins:[ Reflux.listenTo(ModalStore,"onModalChange") ],

    onModalChange: function() {
        this.forceUpdate();
    },

    handleClose: function(evt) {
        WondrousActions.closeSignupPrompt();
	},

    stopProp: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	},

    render: function() {
		divStyle = ModalStore.signupOpen?{display:"block"} : {display:"none"};
		return (
			<div onClick={this.handleClose} className="_dimmer" style={divStyle}>

				<div className="vertical-center-wrapper">
					<div className="vertical-center">

						<div className="modal-wrapper">
                            <div onClick={this.stopProp} className="modal round-5">
                                <LoggedOut/>
                            </div>
						</div>

					</div>
				</div>

			</div>
		);
	}
});

module.exports = SignupModal;
