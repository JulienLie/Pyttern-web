# Invalid: __init__ body not indented
class A:
    pass

class B(A):
def __init__(self, x):
    super().__init__(x)
