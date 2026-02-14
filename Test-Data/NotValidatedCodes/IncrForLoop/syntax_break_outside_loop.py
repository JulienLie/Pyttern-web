# Invalid: break outside loop
def bad():
    break
    for i in []:
        i += 1
