# web
This is the core web platform for Wondrous.


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

### Documentation
Sphinx Documentation is used to lessen the madness of a growing codebase. The documented ReST documents are located in ./docs.

To rebuild the autodocs
```
sphinx-apidoc wondrous -o docs
sudo make clean && sudo make html
```

The result html should be compiled to ./_build/html/index.html
Click on Module Index to see a list of modules 
