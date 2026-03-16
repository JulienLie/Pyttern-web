# IncrForLoop = OR(incrforloop.pyt, incrforloop2.pyt)
#   incrforloop.pyt:  def ?(?*): for ?i in ?: ?i += 1
#   incrforloop2.pyt: def ?(?*): for ?i in ?: ?i = ?i + 1
# Sub-pattern results: incrforloop.pyt ✓  |  incrforloop2.pyt ✗
# Compound result: MATCH (OR: at least one matches)
# MIXED: only the += form matches
def count_up(items):
    for i in items:
        i += 1
