# LoopVarUnused = AND(LoopVarUnused.pyt, NOT(LoopVarUsed.pyt))
# Sub-pattern results: loop.pyt ✓  |  used.pyt ✗
# Compound result: MATCH (loop var exists but body ignores it entirely)
def countdown(steps):
    for step in range(steps):
        print("tick")
        print("tock")
