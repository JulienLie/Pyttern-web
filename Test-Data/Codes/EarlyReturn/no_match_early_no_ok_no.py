# EarlyReturn = AND(earlyreturn.pyt, NOT(okreturn.pyt))
# Sub-pattern results: earlyreturn.pyt ✗  |  okreturn.pyt ✗
# Compound result: NO-MATCH (AND fails because earlyreturn not found)
# Both sub-patterns fail to match
def log_message(msg):
    print(msg)
