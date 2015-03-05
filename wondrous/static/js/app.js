window.React = require('react');
window.Router = require('react-router');
window.$ = window.jQuery = require('jQuery');
window.imagesLoaded = require('imagesloaded');
window.Masonry = require('masonry-layout');
window.Reflux = require('reflux');

var Routes = require('./components/WondrousApp.react')

Router.run(Routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.getElementById('wondrousapp'));
});
