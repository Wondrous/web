var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var Post = require('./Post.react');

var PostModal = React.createClass({

	render: function() {
		return (
			<div className="_dimmer">
				
				<div className="vertical-center-wrapper">
					<div className="vertical-center">
						
						<div className="modal-wrapper">
							<div className="modal">
								{/*
									This is where the post goes (kinda):
									<Post />

									^ The above <Post /> component is the
									expanded post, i.e.,
										<UserTitle>
										<Post Subject>
										<Cover Photo>
										<Post Content>
										<Comments>
										<Footer Buttons>

									The only part of <Post /> that is clearly
									not acceptable is the outermost wrapper div,
									.masonry-brick. .masonry-brick is only good for
									displaying the closed post in the grid.

									Once the modal pops up, all we need is the
									"post-body is-expanded" compontents.

									And, needless to say, as long as the data is 
									here to work with, I will continually work on 
									the styles. 
								*/}

								<ol>
									<li>This is where the post content goes!</li>
									<li>This modal has some pretty crazy CSS</li>
									<li>I will need to modify after the fact</li>
									<li>We will need to prevent the background grid from scrolling
									while the modal is visible.</li>
									<li>The goal is to let the modal scroll
									but not the background content.</li>
									<li>See the comment I added to the PostModal.react.js file. </li>
									<li>The styles for the PostModal are currently in the _post.scss file</li>
									<li>Mabye all PostModal CSS would be better off in its own file...hmmm.</li>
								</ol>
							</div>
						</div>

					</div>
				</div>

			</div>
		);
	}
});

module.exports = PostModal;
