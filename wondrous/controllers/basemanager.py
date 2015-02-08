from sqlalchemy.orm import class_mapper
import datetime

class BaseManager(object):
    SENSITIVE_KW = [
        ['_password','password','is_banned','ouuid', 'email','last_login'],
        ['_password','password','is_banned','ouuid']
    ]

    @classmethod
    def model_to_json(cls,model,level=0):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(model.__class__).columns]
        # then we return their values in a dict
        data = {}
        for c in columns:
            if c in cls.SENSITIVE_KW[level]:
                continue
            val = getattr(model,c)
            if isinstance(val,datetime.datetime):
                val = val.isoformat()
            data[c]=val
        return data
