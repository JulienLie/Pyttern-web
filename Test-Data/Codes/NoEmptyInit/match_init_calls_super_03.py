# NoEmptyInit MATCH: super().__init__ with one arg
class A:
    pass

class B(A):
    def __init__(self, x):
        super().__init__(x)
