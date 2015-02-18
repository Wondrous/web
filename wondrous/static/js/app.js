window.React = require('react');
window.Router = require('react-router');
window.$ = require('jQuery');
window.imagesloaded = require('imagesloaded');
window.Masonry = require('masonry-layout');

var Routes = require('./components/WondrousApp.react')

Router.run(Routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.getElementById('wondrousapp'));
});
