# PrintReturn = AND(print.pyt, NOT(return.pyt))
# Sub-pattern results: print.pyt ✓  |  return.pyt ✓
# Compound result: NO-MATCH (print matches, but NOT(return) fails because return also matches)
# MIXED: sub-pattern1 matched, sub-pattern2 also matched → NOT inverts → compound fails
def format_greeting(name):
    print("Processing: " + name)
    return "Hello, " + name
