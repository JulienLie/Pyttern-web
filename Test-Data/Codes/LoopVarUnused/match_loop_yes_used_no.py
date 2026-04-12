# LoopVarUnused = AND(LoopVarUnused1.pyt, NOT(LoopVarUsed2.pyt))
#   LoopVarUnused1.pyt (and/): def ?(?*): for ? in ?: ?       (has a for-loop)
#   LoopVarUsed2.pyt (and/not/): def ?(?*): for ?i in ?: ? = ?<i>  (loop var used in assignment)
# Sub-pattern results: loop.pyt ✓  |  used.pyt ✗
# Compound result: MATCH (has for-loop, loop var is never used in assignment)
def repeat_action(n):
    for i in range(n):
        print("hello")
