var ModalWrapper = React.createClass({
	handleClose: function(evt){
		if (evt.target==this.refs.closeContainer.getDOMNode()){
			this.props.handleClose(evt);
		}
	},

	stopProp: function(evt){
		evt.stopPropagation();
	},

	render: function() {
		var className = "modal-wrapper";
		if  (typeof this.props.isPicture!=='undefined' && this.props.isPicture==true){
			className += " modal-picture"
		}

		return (
			<div onMouseDown={this.handleClose} className="_dimmer" style={this.props.divStyle}>
				<div className="vertical-center-wrapper">
					<div ref="closeContainer" className="vertical-center">
						<div className={className}>
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
