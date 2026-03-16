# PrintReturn = AND(print.pyt, NOT(return.pyt))
# Sub-pattern results: print.pyt ✗  |  return.pyt ✗
# Compound result: NO-MATCH (AND fails because print not found)
# Both sub-patterns fail to match
def add(a, b):
    result = a + b
