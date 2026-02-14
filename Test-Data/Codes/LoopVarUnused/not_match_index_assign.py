# LoopVarUnused NO MATCH: loop var used in assignment LHS
def copy_into(a, b):
    for i in range(len(a)):
        b[i] = a[i]
