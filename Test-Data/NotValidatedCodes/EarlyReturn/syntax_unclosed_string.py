# Invalid: unclosed string in condition
def safe_div(a, b):
    if b == "zero:
        return 0
    return a / b
