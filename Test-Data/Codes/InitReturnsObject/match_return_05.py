# InitReturnsObject MATCH: __init__ returns something
class Y:
    def __init__(self, v):
        return v
