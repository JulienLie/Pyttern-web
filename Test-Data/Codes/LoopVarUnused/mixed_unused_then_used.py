# LoopVarUnused MIXED: first loop unused, second uses var (only first subpattern matches in first loop)
def process_then_emit(items):
    for _ in items:
        setup()
    for x in items:
        emit(x)
