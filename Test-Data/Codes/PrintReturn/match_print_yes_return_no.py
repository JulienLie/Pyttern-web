# PrintReturn = AND(print.pyt, NOT(return.pyt))
# Sub-pattern results: print.pyt ✓  |  return.pyt ✗
# Compound result: MATCH (print matches, no return to block NOT)
def greet(name):
    print("Hello, " + name)
    print("Welcome!")
