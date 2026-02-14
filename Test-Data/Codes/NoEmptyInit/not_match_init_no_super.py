# NoEmptyInit NO MATCH: __init__ but does not call super
class Parent:
    pass

class Child(Parent):
    def __init__(self, v):
        self.v = v
