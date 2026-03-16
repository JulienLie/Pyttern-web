# InitReturnsObject = AND(initreturnsobject.pyt)
# Sub-pattern results: initreturnsobject.pyt ✓
# Compound result: MATCH (__init__ returns a dict)
class Parser:
    def __init__(self, data):
        self.data = data
        return {"status": "ok"}
