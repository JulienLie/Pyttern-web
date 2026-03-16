# EarlyReturn = AND(earlyreturn.pyt, NOT(okreturn.pyt))
#   earlyreturn.pyt: def ?(?*): ?:  return ?   (return directly inside a block)
#   okreturn.pyt:    def ?(?*): return ?        (top-level return)
# Sub-pattern results: earlyreturn.pyt ✓  |  okreturn.pyt ✗
# Compound result: MATCH (if-block has return, no top-level return)
def check_positive(x):
    if x > 0:
        return True
