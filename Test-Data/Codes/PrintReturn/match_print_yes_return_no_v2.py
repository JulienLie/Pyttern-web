# PrintReturn = AND(print.pyt, NOT(return.pyt))
# Sub-pattern results: print.pyt ✓  |  return.pyt ✗
# Compound result: MATCH (debug-style prints directly in function body, no return)
def process_data(items):
    print("DEBUG: processing", items)
    items.process()
