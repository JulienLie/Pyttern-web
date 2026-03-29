# NoEmptyInit = AND(noemptyinit.pyt)
# Sub-pattern results: noemptyinit.pyt ✗
# Compound result: NO-MATCH (child does not call super().__init__)
class Vehicle:
    def __init__(self, speed):
        self.speed = speed

class Car(Vehicle):
    def __init__(self, speed):
        self.speed = speed
