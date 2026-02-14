# EarlyReturn MIXED: conditional return then later return (matches early return)
def validate(v):
    if v < 0:
        return False
    if v > 100:
        return False
    return True
