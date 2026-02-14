# Invalid: missing comma in print (could be valid in py2, invalid in py3 for multiple args without sep)
# Use invalid: break outside loop
def add(a b):
    print(a b)
    return a + b
