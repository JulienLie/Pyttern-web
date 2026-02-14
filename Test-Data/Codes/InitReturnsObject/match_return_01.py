# InitReturnsObject MATCH: __init__ returns something
class Bad:
    def __init__(self):
        return self
