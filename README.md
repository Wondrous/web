# web
This is the core web platform for Wondrous.

### API Documentation

#### Change User Relationships

##### Levels: api/user, api/wall, api/feed, api/notification

## Action IDs:
Unliked (0)


Liked (1)


Bookmarked (2)


Cancel (3)


Follow (4)


Accept (5)


Block (6)


Deny (7)


Topfriend (8) *follow required*


#### USER level
---------------------------

- **endpoint:** `api/user?user_id={user_id}`

- **method:** GET

- **parameter fields**:


    UserID (int) - valid User ID


- **description:** Returns JSON object containing user information including Username, UserId, & Profile Picture URL.

==============================

- **endpoint:** `api/user/vote`

- **method**: POST

- **parameter fields**:


    UserID (int) - valid User ID


    Action (int) - action ID to perform


- **description:** Returns a JSON object with the 'total_following' and 'total_follower'


==============================

- **endpoint:** `api/user/profile`

- **method**: POST

- **parameter fields**:


    field (str) - The field you want to change (username, first_name, last_name)


    new_value (str) - the new value to replace

- **description:** Returns a JSON object with the field and new value

==============================

- **endpoint:** `api/user/deactivate`

- **method**: POST

- **parameter fields**:


    password (int) - valid password


- **description:** Returns a JSON object with the success message or an error message

==============================

- **endpoint:** `api/user/password`


- **method**: POST


- **parameter fields**:


    old_password (int) - valid User ID


    new_password (int) - action ID to perform


- **description:** Returns a JSON object with the success message or an error message


#### WALL level
-----------------------------

- **endpoint:** `api/wall?user_id={user_id}&page={page}`

- **method:** `GET`

- **description:** `Get a user's wall posts`

==============================

- **endpoint:** `api/wall/repost`

- **method:** `POST`

- **parameter fields**: 


    post_id (int) - valid Post ID, tags (list of text tags), text
    

- **description:** `Repost a post, will always post on the user (who invokes the call) wall.`

==============================

#### FEED Level

- **endpoint:** `api/feed?feed_type={feed_type}&page={page}`

- **method:** GET

- **description:** for paginating through feed Posts, no start will load X most recent and start acts as multiplier to load range between X*page and X + X*page where page is the set of X and X is the amount in the set.


==============================
#### NOTIFICATION level
------------------------------

- **endpoint:** `api/notification?page={page}`

==============================
## Examples

#### Get User Information

```
 GET -> '/api/user/{username}/'
```
This will load a single JSON object that represents the user profile information.

```javascript
$.ajax({
       type: "GET",
       url: '/api/user/dude123/',
       success: function(user_data) {

       }
   });

```

#### Create New Post
```
 POST -> '/api/wall/'
 ```

 This will create a new post to the server, will return the newly created post json object.
```javascript
$.ajax({
       type: "POST",
       url: '/api/wall/',
       data: {
           'subject': 'something intellectual',
           'text':'elaborate on something intellectual',
           'tags':['such','smart','wow','much','knowledge']
       },
       success: function(wall_posts) {

       }
   });
```

```
### Installation
```
brew install pkg-config libffi;
export PKG_CONFIG_PATH=/usr/local/Cellar/libffi/3.0.13/lib/pkgconfig/
pip install -r requirements.txt
```
To run
```
cd <directory containing this file>
$VENV/bin/python setup.py develop
$VENV/bin/initialize_wondrous_db development.ini
$VENV/bin/pserve development.ini
```

### Backend Documentation
Sphinx Documentation is used to lessen the madness of a growing codebase. The documented ReST documents are located in ./docs.

To rebuild the autodocs
```
sphinx-apidoc wondrous -o docs
sudo make clean && sudo make html
```

The result html should be compiled to ```./_build/html/index.html```
Click on Module Index to see a list of modules
