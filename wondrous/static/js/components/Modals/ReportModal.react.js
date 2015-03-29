var ReportConstants = require('../../constants/ReportConstants');
var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');
var ModalWrapper = require('./ModalWrapper.react');

var ReportingForm = React.createClass({
    mixins: [ Reflux.connect(ModalStore) ],
    getInitialState: function(){
        return {reportSubmitted:false, reportId:null}
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
            WondrousActions.sendReport(this.state.reportType, this.state.reportId, reason, text);
        }
    },

    render: function(){

        return (
            <div onClick={this.stopProp}>
                <h1 className="content-report-header">Reporting Content</h1>
                {ModalStore.reportSubmitted==true ?
                    <h2>Thank you for your report!</h2>
                    :
                    <form onSubmit={this.report}>
                        <span className="content-report-input-wrapper">
                            <input id="reportForMature" type="radio" name="reason" value="mature" />
                            <label className="content-report-label" htmlFor="reportForMature">Mature</label>
                        </span>
                        <span className="content-report-input-wrapper">
                            <input id="reportForUninteresting" type="radio" name="reason" value="uninteresting" />
                            <label className="content-report-label" htmlFor="reportForUninteresting">Against my views</label>
                        </span>
                        <span className="content-report-input-wrapper">
                            <input id="reportForCopyright" type="radio" name="reason" value="copyright" />
                            <label className="content-report-label" htmlFor="reportForCopyright">Copyright</label>
                        </span>
                        <span className="content-report-input-wrapper">
                            <input id="reportForSpam" type="radio" name="reason" value="spam" />
                            <label className="content-report-label" htmlFor="reportForSpam">Spam</label>
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
    mixins: [ Reflux.connect(ModalStore) ],

    getInitialState: function() {
        return {reportType: null}
    },

    stopProp: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	},

    render: function() {
		divStyle = this.state.reportType!=null? {display:"block"} : {display:"none"};
		return (
            <ModalWrapper handleClose={function(e){WondrousActions.toggleCommentReport();}} divStyle={divStyle}>
                <ReportingForm />
            </ModalWrapper>
		);
	}
});

module.exports = ReportModal;
