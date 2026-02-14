# NoEmptyInit MATCH: another valid super init
class Handler:
    pass

class ConcreteHandler(Handler):
    def __init__(self, config):
        super().__init__(config)
