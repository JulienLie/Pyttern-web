# EarlyReturn: multiple branches with return - has conditional return (may match)
def choose(a, b):
    if a:
        return 1
    elif b:
        return 2
    return 3
