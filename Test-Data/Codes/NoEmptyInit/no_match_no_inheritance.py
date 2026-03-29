# NoEmptyInit = AND(noemptyinit.pyt)
# Sub-pattern results: noemptyinit.pyt ✗
# Compound result: NO-MATCH (no inheritance, pattern requires class ?(?c))
class Logger:
    def __init__(self, level):
        self.level = level

    def log(self, message):
        print(message)
