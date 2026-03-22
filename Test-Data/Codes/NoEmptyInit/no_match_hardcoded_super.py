# NoEmptyInit = AND(noemptyinit.pyt)
# Sub-pattern results: noemptyinit.pyt ✗
# Compound result: NO-MATCH (super called with hardcoded value, not forwarding ?v)
# Named binding ?v requires the SAME arg passed to __init__ and super().__init__
class Shape:
    def __init__(self, color):
        self.color = color

class Circle(Shape):
    def __init__(self, radius):
        super().__init__("red")
