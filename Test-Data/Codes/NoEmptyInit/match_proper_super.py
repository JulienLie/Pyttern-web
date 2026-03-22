# NoEmptyInit = AND(noemptyinit.pyt)
#   noemptyinit.pyt: class ?c: ?*  /  class ?(?c): def __init__(self, ?v): super().__init__(?v)
#   Detects: child class that properly forwards init arg to parent via super()
# Sub-pattern results: noemptyinit.pyt ✓
# Compound result: MATCH
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name):
        super().__init__(name)
