var WondrousActions = require('../../actions/WondrousActions');
var WondrousConstants = require('../../constants/WondrousConstants');
var ModalStore = require('../../stores/ModalStore')
var Dialogue = React.createClass({
    mixins: [Reflux.connect(ModalStore)],

	render: function() {

        var styles = {
            padding: 30,
            backgroundColor: "rgb(255,255,255)",
            margin: "0 auto",
            width: "70%",
        }

		return (
			<div style={styles} className="round-3" ref="dialogue">
				<div className="dialogue-header">{this.state.dialogueMessage}</div>

                <div style={{ margin: "10px 0 0" }}>
                    {this.state.dialogueType === WondrousConstants.DIALOGUE_INPUT ?
                        <button className="dialogue-btn dialogue-btn--accept round-2" onClick={WondrousActions.acceptDialogue}>Okay</button>
                        :
                        <button className="dialogue-btn dialogue-btn--accept round-2" onClick={WondrousActions.cancelDialogue}>Okay</button>
                    }

                    {this.state.dialogueType === WondrousConstants.DIALOGUE_INPUT ?
                        <button className="dialogue-btn dialogue-btn--cancel round-2" onClick={WondrousActions.cancelDialogue}>Cancel</button>
                        : null}
                </div>
			</div>
		);
	}
});

module.exports = Dialogue;
