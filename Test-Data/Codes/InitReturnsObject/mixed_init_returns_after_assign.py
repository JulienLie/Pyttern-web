# InitReturnsObject MIXED: init does something then returns (still matches)
class Weird:
    def __init__(self):
        self.a = 1
        return self
