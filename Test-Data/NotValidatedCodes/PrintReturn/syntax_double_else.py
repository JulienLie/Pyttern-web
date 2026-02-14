# Invalid: else without if / double else
def bad():
    if True:
        return 1
    else:
        return 2
    else:
        return 3
