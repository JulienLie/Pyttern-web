# LoopVarUnused = AND(LoopVarUnused1.pyt, NOT(LoopVarUsed2.pyt))
# Sub-pattern results: loop.pyt ✓  |  used.pyt ✗
# Compound result: MATCH (loop var exists but body ignores it entirely)
def countdown(steps):
    for step in range(steps):
        print("tick")
        print("tock")
