# Invalid: __init__ without def
class Base:
    pass

class Derived(Base):
    __init__(self, v):
        super().__init__(v)
