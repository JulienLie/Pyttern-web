# Student A1 - Calculator class
# Assignment: Implement a Calculator class with basic operations

class Calculator:
    def __init__(self, initial_value):
        self.value = initial_value
        self.history = []

    def add(self, number):
        self.history.append(self.value)
        self.value = self.value + number
        return self.value

    def subtract(self, number):
        self.history.append(self.value)
        self.value = self.value - number
        return self.value

    def get_history(self):
        return self.history
