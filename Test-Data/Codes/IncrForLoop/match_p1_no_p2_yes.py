# IncrForLoop = OR(incrforloop.pyt, incrforloop2.pyt)
# Sub-pattern results: incrforloop.pyt ✗  |  incrforloop2.pyt ✓
# Compound result: MATCH (OR: at least one matches)
# MIXED: only the = i + 1 form matches
def count_up(items):
    for i in items:
        i = i + 1
