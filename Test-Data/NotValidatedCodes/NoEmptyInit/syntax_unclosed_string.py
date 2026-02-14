# Invalid: unclosed string
class Parent:
    doc = "parent

class Child(Parent):
    def __init__(self, v):
        super().__init__(v)
