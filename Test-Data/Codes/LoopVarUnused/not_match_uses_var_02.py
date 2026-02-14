# LoopVarUnused NO MATCH: assigns using loop index (other subpattern)
def fill_array(n):
    result = [0] * n
    for i in range(n):
        result[i] = i
    return result
