var Feed = require('./Feed.react');
var UserStore = require('../../stores/UserStore');
var ModalStore = require('../../stores/ModalStore');
var LandingApp = require('../Landing.react');
var WondrousAPI = require('../../utils/WondrousAPI');

var Admin = React.createClass({
    mixins: [ Router.Navigation ],
    transition: function(){
        this.replaceWith('/');
    },
    componentDidMount: function(){
        WondrousAPI.admin_auth({
            callback: function(err,res){
                if(err!=null){
                    this.transition();
                }
            }
        });
    },
    onResult: function(err,res){
        console.log(err,res);
        if(err==null){
            this.refs.result.getDOMNode().value=res.result;
        }else{
            this.refs.result.getDOMNode().value=err.error;
        }
    },

    onQuery: function(e){
        this.refs.result.getDOMNode().value='';
        WondrousAPI.admin_query({
            text: this.refs.query.getDOMNode().value.trim(),
            callback: this.onResult
        })
    },

    render: function(){

        return (
            <div style={{paddingTop:"100px"}}>
                <textarea style={{width:"500px", height:"300px"}} ref="query"></textarea>
                <button onClick={this.onQuery}>Query</button>
                <textarea style={{width:"500px", height:"300px"}} ref="result"></textarea>
            </div>
        );
    }
});

module.exports = Admin;
