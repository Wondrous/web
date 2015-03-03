# web
This is the core web platform for Wondrous.

### Installation
To install Python's ```pip``` (if you haven't installed it already), follow the instructions here: ```https://pip.pypa.io/en/latest/installing.html```.

Then, to install ```virtualenv``` (if you haven't installed it already), run the following command:  
```sudo pip install virtualenv```.

------------------------------

```cd``` into the directory where you'd like to build the project, then...
```
virtualenv --no-site-packages webenv
cd webenv
git clone https://github.com/Wondrous/web.git
source bin/activate
brew install pkg-config libffi;
export PKG_CONFIG_PATH=/usr/local/Cellar/libffi/3.0.13/lib/pkgconfig/
cd web
python setup.py develop
pip install -r requirements.txt
```
**To run the server:**
```
cd <directory containing this file>
$VENV/bin/python setup.py develop
$VENV/bin/initialize_wondrous_db development.ini
$VENV/bin/pserve development.ini --reload
```

*Note: ```$VENV``` indicates that you are currently within your virtual environment, having run the command ```source activate``` (likely from within the ```bin``` directory – wherever the ```activate``` file is).*

**To build the front-end (React + Flux) [also in ```/static/readme.md```]:**

1) Install Node.js at: http://nodejs.org

2) ```cd``` into the ```/static/``` dir.

3) To install everything in package.json `sudo npm install`

4) To build bundle.min.js `npm run build`

5) To start watching for changes (compiles to bundle.js) `npm run start`

**Note:** Never directly edit `style.scss` or `style.css`. When you run `npm run build`, the files in `/css/partials/`, `/css/vendor/`, `/css/fonts/`, and `/css/modules/` are compiled into the `styles.scss` file. In other words, the files in those 4 directories are the ones you want to edit, not the dynamically compiled `styles.scss` file.

**Note:** Never directly edit `bundle.js`. All the JS files for editing are found in the `js/actions/`, `js/components/`, `js/constants/`, `js/dispatcher/`, `js/stores/`,`js/util/`, and `js/vendor/` directories. When you run `npm run start`, the files in those directories are watched, and auto-compiled into `bundle.js` whenever you make a change.

### API Documentation

#### Change User Relationships

##### Levels: api/user, api/wall, api/feed, api/notification, api/post

## Action IDs:

- **Liked** (`0`) - toggle (unlike)


- **Bookmarked** (`1`) [defered for now]


- **Cancel** (`2`)


- **Follow** (`3`) - toggle (unfollow)


- **Accept** (`4`)


- **Block** (`5`)


- **Deny** (`6`) -> will change request status to unfollowed


- **Topfriend** (`7`) [follow required]


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


#### FEED Level
------------------------------

- **endpoint:** `api/feed?feed_type={feed_type}&page={page}`

- **method:** GET

- **description:** for paginating through feed Posts, no start will load X most recent and start acts as multiplier to load range between X*page and X + X*page where page is the set of X and X is the amount in the set.


#### NOTIFICATION level
------------------------------

- **endpoint:** `api/notification?page={page}`

- **method:** GET

- **description:** for paginating through notifications, no start will load X most recent and start acts as multiplier to load range between X*page and X + X*page where page is the set of X and X is the amount in the set.



#### POST level
---------------


- **endpoint:** `/api/post`

- **method:** DELETE

- **description:** This is a soft deletion operation that marks posts as to be deleted and inactive. 


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



### Backend Documentation
Sphinx Documentation is used to lessen the madness of a growing codebase. The documented ReST documents are located in ./docs.

To rebuild the autodocs
```
sphinx-apidoc wondrous -o docs
sudo make clean && sudo make html
```

The result html should be compiled to ```./_build/html/index.html```
Click on Module Index to see a list of modules
