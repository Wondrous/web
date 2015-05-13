var WondrousActions = require('../../actions/WondrousActions');
var WondrousConstants = require('../../constants/WondrousConstants');
var ModalStore = require('../../stores/ModalStore');
var Dialogue = React.createClass({
    mixins: [Reflux.connect(ModalStore)],

	render: function() {

        var styles = {
            padding: 30,
            backgroundColor: "rgb(255,255,255)",
            margin: "0 auto",
            width: "70%",
        };

		return (
			<div style={styles} className="round-3" ref="dialogue">
				<div className="dialogue-header">{this.state.dialogueMessage}</div>

                {this.state.dialogueInfo === "__no_picture" ?
                    <div className="dialogue-info">
                        If you're having trouble finding an image, take a look at these amazing ones on <b><a style={{ color: "rgb(61,61,61)" }} target="_blank" href="https://unsplash.com">Unsplash</a></b>!
                    </div>
                    : null}

                {this.state.dialogueInfo && this.state.dialogueInfo !== "__no_picture" ?
                    <div className="dialogue-info">
                        {this.state.dialogueInfo}
                    </div>
                    : null}

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
