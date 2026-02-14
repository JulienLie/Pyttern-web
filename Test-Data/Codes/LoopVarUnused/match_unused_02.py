# LoopVarUnused MATCH: iterate but only use side effect
def repeat_n_times(n):
    for i in range(n):
        do_work()
