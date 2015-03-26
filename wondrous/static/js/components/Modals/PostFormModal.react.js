var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');
var UserStore = require('../../stores/UserStore');
var WondrousConstants = require('../../constants/WondrousConstants');
var PostForm = require('./PostForm.react');
var ModalWrapper = require('./ModalWrapper.react');

var PostFormModal = React.createClass({
	mixins:[
        Reflux.connect(ModalStore)
    ],
	getInitialState: function(){
		return {postFormOpen:false}
	},
	componentDidMount: function(){
		var con = $(this.refs.modalWrapper.getDOMNode());
		con.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',function(){
			$(this).removeClass("animated bounceInDown");
		});
	},

	handleClose: function(evt) {
		var con = $(this.refs.modalWrapper.getDOMNode());
		WondrousActions.closePostModal();

		if(typeof evt!=='undefined'){
			evt.preventDefault();
			evt.stopPropagation();
		}
	},
	
	componentDidUpdate: function(){
		if (this.state.postFormOpen){
			var con = $(this.refs.modalWrapper.getDOMNode());
			con.addClass("animated bounceInDown");
		}
	},

	render: function() {

		divStyle = this.state.postFormOpen ? {display:"block"} : {display:"none"};

		return (
			<ModalWrapper handleClose={this.handleClose} divStyle={divStyle}>
                <PostForm ref="modalWrapper" handleClose={this.handleClose}/>
            </ModalWrapper>
		);
	}
});



module.exports = PostFormModal;
