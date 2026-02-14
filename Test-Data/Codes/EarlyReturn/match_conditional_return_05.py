# EarlyReturn MATCH: guard clause return
def find(items, target):
    if not items:
        return -1
    for i, x in enumerate(items):
        if x == target:
            return i
    return -1
