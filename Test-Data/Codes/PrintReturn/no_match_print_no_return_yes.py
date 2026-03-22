# PrintReturn = AND(print.pyt, NOT(return.pyt))
# Sub-pattern results: print.pyt ✗  |  return.pyt ✓
# Compound result: NO-MATCH (AND fails immediately because print not found)
# MIXED: sub-pattern1 fails, sub-pattern2 would match but AND short-circuits
def square(x):
    return x * x
