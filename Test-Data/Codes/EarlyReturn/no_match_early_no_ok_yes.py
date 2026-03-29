# EarlyReturn = AND(earlyreturn.pyt, NOT(okreturn.pyt))
# Sub-pattern results: earlyreturn.pyt ✗  |  okreturn.pyt ✓
# Compound result: NO-MATCH (AND fails on earlyreturn, no block-level return)
# MIXED: no conditional return but has top-level return
def double(x):
    return x * 2
