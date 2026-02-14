# PrintReturn MIXED: print and return in branches (still both present)
def maybe_report(flag):
    if flag:
        print("yes")
        return 1
    return 0
