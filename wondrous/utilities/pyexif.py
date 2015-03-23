# #!/usr/bin/env python
# # -*- coding: utf-8 -*-
#
# #
# # Company: WONDROUS
# # Created by: John Zimmerman
# #
# # UTILITIES/PYEXIF.PY
# #
#
# import json
# import re
# import subprocess
#
# def _install_exiftool_info():
#     print  """
# Cannot find 'exiftool'.
#
# The ExifEditor class requires that the 'exiftool' command-line
# utility is installed in order to work. Information on obtaining
# this excellent utility can be found at:
#
# http://www.sno.phy.queensu.ca/~phil/exiftool/
# """
#
#
# def _runproc(cmd, fpath=None):
#     if not _EXIFTOOL_INSTALLED:
#         _install_exiftool_info()
#         raise RuntimeError("Running this class requires that exiftool is installed")
#     pipe = subprocess.PIPE
#     proc = subprocess.Popen([cmd], shell=True, stdin=pipe, stdout=pipe,
#             stderr=pipe, close_fds=True)
#     proc.wait()
#     err = proc.stderr.read()
#     if err:
#         # See if it's a damaged EXIF directory. If so, fix it and re-try
#         if err.startswith("Warning: Bad ExifIFD directory") and fpath is not None:
#             fixcmd = """exiftool -overwrite_original_in_place -all= -tagsfromfile @ -all:all -unsafe "{fpath}" """.format(**locals())
#             try:
#                 _runproc(fixcmd)
#             except RuntimeError:
#                 # It will always raise a warning, so ignore it
#                 pass
#             # Retry
#             return _runproc(cmd, fpath)
#         raise RuntimeError(err)
#     else:
#         return proc.stdout.read()
#
#
# # Test that the exiftool is installed
# _EXIFTOOL_INSTALLED = True
# try:
#     out = _runproc("exiftool some_dummy_name.jpg")
# except RuntimeError as e:
#     # If the tool is installed, the error should be 'File not found'.
#     # Otherwise, assume it isn't installed.
#     err = "{0}".format(e).strip()
#     if "File not found:" not in err:
#         _EXIFTOOL_INSTALLED = False
#         _install_exiftool_info()
#
#
#
# class ExifEditor(object):
#
#     def __init__(self, photo=None, save_backup=False):
#         self.save_backup = save_backup
#         if not save_backup:
#             self._optExpr = "-overwrite_original_in_place"
#         else:
#             self._optExpr = ""
#         self.photo = photo
#         # Tuples of (degrees, mirrored)
#         self._rotations = {
#                 0: (0, 0),
#                 1: (0, 0),
#                 2: (0, 1),
#                 3: (180, 0),
#                 4: (180, 1),
#                 5: (90, 1),
#                 6: (90, 0),
#                 7: (270, 1),
#                 8: (270, 0)}
#         self._invertedRotations = dict([[v, k] for k, v in self._rotations.items()])
#         # DateTime patterns
#         self._datePattern = re.compile(r"\d{4}:[01]\d:[0-3]\d$")
#         self._dateTimePattern = re.compile(r"\d{4}:[01]\d:[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d$")
#         self._badTagPat = re.compile(r"Warning: Tag '[^']+' does not exist")
#
#         super(ExifEditor, self).__init__()
#
#
#     def getOrientation(self):
#         """Returns the current Orientation tag number."""
#         return self.getTag("Orientation", 1)
#
#     def setOrientation(self, val):
#         """Orientation codes:
#                Rot    Img
#             1:   0    Normal
#             2:   0    Mirrored
#             3: 180    Normal
#             4: 180    Mirrored
#             5: +90    Mirrored
#             6: +90    Normal
#             7: -90    Mirrored
#             8: -90    Normal
#         """
#         cmd = """exiftool {self._optExpr} -Orientation#='{val}' "{self.photo}" """.format(**locals())
#         _runproc(cmd, self.photo)
#
#     def clearKeywords(self):
#         """Removes all keywords from the image."""
#         self.setTag("Keywords", "")
#
#
#     def getTag(self, tag, default=None):
#         """Returns the value of the specified tag, or the default value
#         if the tag does not exist.
#         """
#         #cmd = """exiftool -j -d "%Y:%m:%d %H:%M:%S" --{tag} "{self.photo}" """.format(**locals())
#         cmd = """exiftool -j -d "%Y:%m:%d %H:%M:%S" -{tag}# "{self.photo}" """.format(**locals())
#         out = _runproc(cmd, self.photo)
#         info = json.loads(out)[0]
#         ret = info.get(tag, default)
#         return ret
#
#
#     def setTag(self, tag, val):
#         """Sets the specified tag to the passed value. You can set multiple values
#         for the same tag by passing those values in as a list.
#         """
#         if not isinstance(val, (list, tuple)):
#             val = [val]
#         vallist = ["-{0}={1}".format(tag, v) for v in val]
#         valstr = " ".join(vallist)
#         cmd = """exiftool {self._optExpr} {valstr} "{self.photo}" """.format(**locals())
#         try:
#             out = _runproc(cmd, self.photo)
#         except RuntimeError as e:
#             err = "{0}".format(e).strip()
#             if self._badTagPat.match(err):
#                 print "Tag '{tag}' is invalid.".format(**locals())
#             else:
#                 raise
#
#
# def usage():
#     print """
# To use this module, create an instance of the ExifEditor class, passing
# in a path to the image to be handled. You may also pass in whether you
# want the program to automatically keep a backup of your original photo
# (default=False). If a backup is created, it will be in the same location
# as the original, with "_ORIGINAL" appended to the file name.
#
# Once you have an editor instance, you call its methods to get information
# about the image, or to modify the image's metadata.
# """
#
#
# if __name__ == "__main__":
#     # usage()
#     pass
#
