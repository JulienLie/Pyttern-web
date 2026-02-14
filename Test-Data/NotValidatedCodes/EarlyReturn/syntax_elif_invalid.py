# Invalid: elif without preceding if (orphan elif)
def bad():
    elif True:
        return 1
    return 2
