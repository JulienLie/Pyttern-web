# IncrForLoop MIXED: one loop with +=, one without
def mixed(seq):
    for i in seq:
        i += 1
    for x in seq:
        print(x)
