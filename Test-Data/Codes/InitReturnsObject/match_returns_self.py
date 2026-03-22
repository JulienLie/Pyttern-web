# InitReturnsObject = AND(initreturnsobject.pyt)
#   initreturnsobject.pyt: class ?: def __init__(?*): return ?
#   Detects: __init__ that returns a value (anti-pattern in Python)
# Sub-pattern results: initreturnsobject.pyt ✓
# Compound result: MATCH
class Config:
    def __init__(self, path):
        self.path = path
        return self
