var WondrousActions = require('../../actions/WondrousActions');
var WondrousConstants = require('../../constants/WondrousConstants');
var ModalStore = require('../../stores/ModalStore')
var Dialogue = React.createClass({
    mixins: [Reflux.connect(ModalStore)],

	render: function() {

		return (
			<div ref="dialogue">
				<div>{this.state.dialogueMessage}</div>
                {this.state.dialogueType===WondrousConstants.DIALOGUE_INPUT
                    ?<button onClick={WondrousActions.acceptDialogue}>Okay</button>:
                    <button onClick={WondrousActions.cancelDialogue}>Okay</button>
                }

                {this.state.dialogueType===WondrousConstants.DIALOGUE_INPUT?
                <button onClick={WondrousActions.cancelDialogue}>CANCEL</button>:
                null}
			</div>
		);
	}
});

module.exports = Dialogue;
