var PostInputs = React.createClass({
	render: function () {
		var titlePrompt = this.props.titlePrompt;
		var contentPrompt = this.props.contentPrompt;
		return (
			<div>
				<div className="new-post-element">
					<div style={{"position": "relative", "margin": "0 auto", "margin-bottom": "-1px;"}}>
						<input id="postSubject" className="new-post-subject" maxLength="45" placeholder={titlePrompt} spellCheck="False" />
					</div>
				</div>

				<div className="new-post-element" style={{"background-color": "rgb(255,255,255);"}}>
					<textarea id="postTextarea" maxlength="5000" placeholder={contentPrompt} ></textarea>
				</div>
				<button>Submit</button>
			</div>);
	}
});

var PostForm = React.createClass({
	render: function () {
		return (
			<div id="new-post-dialogue" className="new-post-wrapper round-3">
				<PostInputs titlePrompt="Add a title!" contentPrompt="Write something. Post a link. Add #hashtags." />
			</div>);
	},

	componentDidMount: function () {
		// Example of how to write the actions that 
		// will occur after React renders the item.
		initSmartTextarea();
	}
});