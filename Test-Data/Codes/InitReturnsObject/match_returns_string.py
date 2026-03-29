# InitReturnsObject = AND(initreturnsobject.pyt)
# Sub-pattern results: initreturnsobject.pyt ✓
# Compound result: MATCH (__init__ returns a string literal)
class Validator:
    def __init__(self, rules):
        self.rules = rules
        return "initialized"
