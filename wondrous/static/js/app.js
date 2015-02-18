window.React = require('react');
window.Router = require('react-router');
window.$ = require('jQuery');
var Routes = require('./components/WondrousApp.react')

Router.run(Routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.getElementById('wondrousapp'));
});
