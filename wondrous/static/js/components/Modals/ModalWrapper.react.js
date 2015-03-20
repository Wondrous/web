var ModalWrapper = React.createClass({
	handleClose: function(evt){
		if (evt.target==this.refs.closeContainer.getDOMNode()){
			this.props.handleClose(evt);
		}
	},

	render: function(){
		return (
			<div onClick={this.handleClose} className="_dimmer" style={this.props.divStyle}>
				<div className="vertical-center-wrapper">
					<div ref="closeContainer" className="vertical-center">
						<div className="modal-wrapper">
                            <div className="modal round-5">
							{this.props.children}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = ModalWrapper;
