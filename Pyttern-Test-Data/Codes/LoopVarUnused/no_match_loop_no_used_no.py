# LoopVarUnused = AND(LoopVarUnused.pyt, NOT(LoopVarUsed.pyt))
# Sub-pattern results: loop.pyt ✗  |  used.pyt ✗
# Compound result: NO-MATCH (no for-loop at all, AND fails immediately)
# Both sub-patterns fail to match
def greet(name):
    msg = "Hello " + name
    print(msg)
