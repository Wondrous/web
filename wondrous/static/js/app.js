window.React = require('react');
window.Router = require('react-router');
window.$ = window.jQuery = require('jquery');
window.imagesLoaded = require('imagesloaded');
window.Masonry = require('masonry-layout');
window.Reflux = require('reflux');
window.moment = require('moment');
window.cropper = require("cropper");
// window.overlay = require("jquery-overlay");

var Routes = require('./components/WondrousApp.react')

Router.run(Routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.getElementById('wondrousapp'));
});
