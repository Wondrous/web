var ReportConstants = require('../../constants/ReportConstants');
var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');

var ReportingForm = React.createClass({
    mixins: [ Reflux.listenTo(ModalStore,"onModalChange") ],

    onModalChange: function() {
        this.forceUpdate();
    },

    stopProp: function(e){
        e.stopPropagation();
    },

    radioChange: function(e){
    },

    report: function(e){
        e.preventDefault();
        var reason = -1;
        switch($("input[name=reason]:checked").val()) {
            case "mature":
                reason = ReportConstants.MATURE;
                break;
            case "uninteresting":
                reason = ReportConstants.UNINTERESTING;
                break;
            case "copyright":
                reason = ReportConstants.COPYRIGHT;
                break;
            case "spam":
                reason = ReportConstants.SPAM;
                break;
        }
        if(reason>-1){
            var text = this.refs.comment.getDOMNode().value.trim();
            WondrousActions.sendReport(ModalStore.reportType, ModalStore.reportId, reason, text);
        }
    },

    render: function(){

        return (
            <div onClick={this.stopProp}>
                <h1 className="content-report-header">Reporting Content</h1>
                {ModalStore.reportSubmitted==true ?
                    <h2>Thank you for your report!</h2>
                    :
                    <form onChange={this.radioChange} onSubmit={this.report}>
                        <span className="content-report-input-wrapper">
                            <input type="radio" name="reason" value="mature" />Mature
                        </span>
                        <span className="content-report-input-wrapper">
                            <input type="radio" name="reason" value="uninteresting" />Against my views
                        </span>
                        <span className="content-report-input-wrapper">
                            <input type="radio" name="reason" value="copyright" />Copyright
                        </span>
                        <span className="content-report-input-wrapper">
                            <input type="radio" name="reason" value="spam" />Spam
                        </span>
                        <div>
                            <textarea className="content-report-textarea" ref="comment" placeholder="Place write any additional comments here"></textarea>
                        </div>
                        <button type="submit">Report</button>
                    </form>
                }
            </div>
        );
    }
});


var ReportModal = React.createClass({
    mixins:[ Reflux.listenTo(ModalStore,"onModalChange") ],
    onModalChange: function(){
        this.forceUpdate();
    },

    getInitialState: function() {
        return { data:{reportType: null} }
    },

    handleClose: function(evt) {
		WondrousActions.toggleCommentReport();
	},

    stopProp: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	},

    render: function() {
		divStyle = ModalStore.reportType!=null? {display:"block"} : {display:"none"};
		return (
			<div onClick={this.handleClose} className="_dimmer" style={divStyle}>

				<div className="vertical-center-wrapper">
					<div className="vertical-center">

						<div className="modal-wrapper">
                            <div onClick={this.stopProp} className="modal round-5">
                                <ReportingForm />
                            </div>
						</div>

					</div>
				</div>

			</div>
		);
	}
});

module.exports = ReportModal;
