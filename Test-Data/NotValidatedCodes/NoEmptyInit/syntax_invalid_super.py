# Invalid: super() with wrong syntax
class X:
    pass

class Y(X):
    def __init__(self, a):
        super(().__init__(a)
