# EarlyReturn = AND(earlyreturn.pyt, NOT(okreturn.pyt))
# Sub-pattern results: earlyreturn.pyt ✓  |  okreturn.pyt ✗
# Compound result: MATCH (while-block has return, no top-level return)
def wait_for_ready(sensor):
    while sensor.check():
        return sensor.value
