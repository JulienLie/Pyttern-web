# EraseArg = AND(erasearg.pyt)
#   erasearg.pyt: def ?(?var): ?var = ?
#   Detects: function parameter immediately overwritten (anti-pattern)
#   Named binding ?var ensures the SAME name appears as param and assignment target
# Sub-pattern results: erasearg.pyt ✓
# Compound result: MATCH
def process(data):
    data = []
