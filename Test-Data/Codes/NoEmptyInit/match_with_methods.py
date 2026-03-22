# NoEmptyInit = AND(noemptyinit.pyt)
# Sub-pattern results: noemptyinit.pyt ✓
# Compound result: MATCH (proper super forwarding, extra methods don't affect matching)
class Base:
    def __init__(self, value):
        self.value = value

    def display(self):
        print(self.value)

class Extended(Base):
    def __init__(self, value):
        super().__init__(value)

    def double(self):
        return self.value * 2
