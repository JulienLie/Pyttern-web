# InitReturnsObject NO MATCH: normal method returns, not __init__
class K:
    def __init__(self):
        pass
    def get(self):
        return self
