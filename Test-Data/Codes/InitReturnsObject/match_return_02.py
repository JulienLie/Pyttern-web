# InitReturnsObject MATCH: __init__ returns value
class C:
    def __init__(self, x):
        return x
