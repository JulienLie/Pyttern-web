# IncrForLoop = OR(incrforloop.pyt, incrforloop2.pyt)
# Sub-pattern results: incrforloop.pyt ✓  |  incrforloop2.pyt ✓
# Compound result: MATCH (OR: both match)
# Both increment forms present in the same function
def double_increment(items):
    for i in items:
        i += 1
        i = i + 1
