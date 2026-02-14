# InitReturnsObject MATCH: return in __init__
class X:
    def __init__(self):
        return 42
