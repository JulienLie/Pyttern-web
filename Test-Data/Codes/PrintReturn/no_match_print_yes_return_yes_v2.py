# PrintReturn = AND(print.pyt, NOT(return.pyt))
# Sub-pattern results: print.pyt ✓  |  return.pyt ✓
# Compound result: NO-MATCH (both sub-patterns match individually, NOT inverts return → compound fails)
# MIXED: print found but return also found
def log_and_compute(x, y):
    print("Computing sum")
    result = x + y
    print("Done")
    return result
