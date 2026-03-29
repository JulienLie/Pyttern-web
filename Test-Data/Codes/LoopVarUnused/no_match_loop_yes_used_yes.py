# LoopVarUnused = AND(LoopVarUnused.pyt, NOT(LoopVarUsed.pyt))
# Sub-pattern results: loop.pyt ✓  |  used.pyt ✓
# Compound result: NO-MATCH (loop matches, but NOT(used) fails because var IS used)
# MIXED: loop sub-pattern matches, but used sub-pattern also matches → NOT inverts → fails
def build_squares(n):
    for i in range(n):
        result = i * i
