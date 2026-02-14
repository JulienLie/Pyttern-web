# NoEmptyInit MATCH: minimal super init
class X:
    pass

class Y(X):
    def __init__(self, a):
        super().__init__(a)
