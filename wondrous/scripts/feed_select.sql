explain analyze select distinct post.id, vote.id
from post join feed_post_link on feed_post_link.id=post.id and feed_post_link.feed_id=1
join "user" on "user".id=post.user_id
left outer join vote on vote.subject_id=post.id and vote.user_id=1 and vote.status=1
left outer join vote as v1 on (v1.subject_id = post.user_id) and (v1.status=6 or v1.status=7)
where "user".is_private=false or v1.user_id=1;

select distinct post.id, vote.id
from post join feed_post_link on feed_post_link.id=post.id and feed_post_link.feed_id=1
join "user" on "user".id=post.user_id
left outer join vote on vote.subject_id=post.id and vote.user_id=1 and vote.status=1
left outer join vote as v1 on (v1.subject_id = post.user_id) and (v1.status=6 or v1.status=7)
where "user".is_private=false or v1.user_id=1;

select distinct post.id, vote.id
from post join feed_post_link on feed_post_link.id=post.id and feed_post_link.feed_id=1
join "user" on "user".id=post.user_id
join vote as v1 on ("user".is_private=false or v1.user_id="user".id) or (v1.subject_id = post.user_id) and (v1.status=6 or v1.status=7)
left outer join vote on vote.subject_id=post.id and vote.user_id=1 and vote.status=1;
