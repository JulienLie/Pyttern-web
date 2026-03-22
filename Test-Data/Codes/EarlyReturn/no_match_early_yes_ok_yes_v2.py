# EarlyReturn = AND(earlyreturn.pyt, NOT(okreturn.pyt))
# Sub-pattern results: earlyreturn.pyt ✓  |  okreturn.pyt ✓
# Compound result: NO-MATCH (both sub-patterns match individually)
# MIXED: try-block has return (earlyreturn ✓), AND top-level return (okreturn ✓)
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return 0
    return None
