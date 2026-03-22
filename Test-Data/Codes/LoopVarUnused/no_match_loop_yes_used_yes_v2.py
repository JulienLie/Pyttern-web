# LoopVarUnused = AND(LoopVarUnused.pyt, NOT(LoopVarUsed.pyt))
# Sub-pattern results: loop.pyt ✓  |  used.pyt ✓
# Compound result: NO-MATCH (loop var is used via containment ?<i> in assignment)
# MIXED: loop found, var used in list construction → NOT fails
def collect_indices(n):
    for i in range(n):
        data = [i]
