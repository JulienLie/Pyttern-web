# LoopVarUnused = AND(LoopVarUnused.pyt, NOT(LoopVarUsed.pyt))
#   LoopVarUnused.pyt (and/): def ?(?*): for ? in ?: ?       (has a for-loop)
#   LoopVarUsed.pyt (and/not/): def ?(?*): for ?i in ?: ? = ?<i>  (loop var used in assignment)
# Sub-pattern results: loop.pyt ✓  |  used.pyt ✗
# Compound result: MATCH (has for-loop, loop var is never used in assignment)
def repeat_action(n):
    for i in range(n):
        print("hello")
