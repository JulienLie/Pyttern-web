# InitReturnsObject = AND(initreturnsobject.pyt)
# Sub-pattern results: initreturnsobject.pyt ✗
# Compound result: NO-MATCH (no return in __init__)
class Config:
    def __init__(self, path):
        self.path = path
        self.loaded = False
