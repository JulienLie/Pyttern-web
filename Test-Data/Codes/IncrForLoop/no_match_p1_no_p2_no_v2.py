# IncrForLoop = OR(incrforloop.pyt, incrforloop2.pyt)
# Sub-pattern results: incrforloop.pyt ✗  |  incrforloop2.pyt ✗
# Compound result: NO-MATCH (different variable incremented, not the loop var ?i)
# Named binding ?i ensures the SAME variable must be both loop var and incremented
def process(items):
    for i in items:
        count = count + 1
