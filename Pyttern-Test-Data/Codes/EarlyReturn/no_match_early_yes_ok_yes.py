# EarlyReturn = AND(earlyreturn.pyt, NOT(okreturn.pyt))
# Sub-pattern results: earlyreturn.pyt ✓  |  okreturn.pyt ✓
# Compound result: NO-MATCH (both sub-patterns match, NOT(okreturn) fails)
# MIXED: if-block has return (earlyreturn ✓), AND top-level return exists (okreturn ✓)
def check_value(x):
    if x > 0:
        return True
    return False
