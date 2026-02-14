# NoEmptyInit NO MATCH: empty __init__
class Base:
    pass

class Child(Base):
    def __init__(self):
        pass
