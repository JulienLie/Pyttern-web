# NoEmptyInit MATCH: subclass with __init__ that calls super().__init__(v)
class Base:
    pass

class Child(Base):
    def __init__(self, v):
        super().__init__(v)
