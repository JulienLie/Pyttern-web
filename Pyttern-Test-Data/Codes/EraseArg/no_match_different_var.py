# EraseArg = AND(erasearg.pyt)
# Sub-pattern results: erasearg.pyt ✗
# Compound result: NO-MATCH (different variable assigned, not the param)
# Named binding ?var fails: param is "x" but assigned var is "result"
def compute(x):
    result = x * 2
    return result
