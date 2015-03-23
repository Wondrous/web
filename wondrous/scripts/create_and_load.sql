DROP TABLE "user";
DROP TABLE feed;
DROP TABLE feed_post_link;
DROP TABLE post;
DROP TABLE vote;

CREATE TABLE "user" (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  is_private BOOLEAN
);

CREATE TABLE feed (
  id INTEGER PRIMARY KEY,
  user_id INTEGER
);

CREATE TABLE feed_post_link (
  id INTEGER PRIMARY KEY,
  post_id INTEGER,
  feed_id INTEGER
);

CREATE TABLE post (
  id INTEGER PRIMARY KEY,
  user_id INTEGER
);

CREATE TABLE vote (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  subject_id INTEGER,
  status INTEGER
);


copy "user"(id,name,is_private)
from '/Users/ziyuanliu/pyramidenv/web/wondrous/scripts/users.csv'
WITH DELIMITER '|' CSV HEADER;

copy feed(id,user_id)
from '/Users/ziyuanliu/pyramidenv/web/wondrous/scripts/feeds.csv'
WITH DELIMITER '|' CSV HEADER;

copy feed_post_link(id,post_id,feed_id)
from '/Users/ziyuanliu/pyramidenv/web/wondrous/scripts/feed_post_links.csv'
WITH DELIMITER '|' CSV HEADER;

CREATE INDEX idx_fdl_post_id ON feed_post_link (post_id);
CREATE INDEX idx_fdl_feed_id ON feed_post_link (feed_id);

copy post(id,user_id)
from '/Users/ziyuanliu/pyramidenv/web/wondrous/scripts/posts.csv'
WITH DELIMITER '|' CSV HEADER;

CREATE INDEX idx_post_user_id ON post (user_id);

copy vote(id,user_id,subject_id,status)
from '/Users/ziyuanliu/pyramidenv/web/wondrous/scripts/follow_votes.csv'
WITH DELIMITER '|' CSV HEADER;

copy vote(id,user_id,subject_id,status)
from '/Users/ziyuanliu/pyramidenv/web/wondrous/scripts/like_votes.csv'
WITH DELIMITER '|' CSV HEADER;

CREATE INDEX idx_vote_user_id ON vote (user_id);
CREATE INDEX idx_vote_subject_id ON vote (subject_id);
CREATE INDEX idx_vote_status ON vote (status);
