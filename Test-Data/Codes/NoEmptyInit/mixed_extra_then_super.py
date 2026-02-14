# NoEmptyInit MIXED: init does something then super (may still match if pattern allows)
class Base:
    pass

class Derived(Base):
    def __init__(self, v):
        self.v = v
        super().__init__(v)
