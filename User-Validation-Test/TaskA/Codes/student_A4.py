# Student A4 - Calculator class
# Assignment: Implement a Calculator class with basic operations

class Calculator:
    def __init__(self, initial_value):
        self.value = initial_value
        self.operations_count = 0

    def add(self, number):
        self.value = self.value + number
        self.operations_count = self.operations_count + 1
        return self.value

    def multiply(self, number):
        self.value = self.value * number
        self.operations_count = self.operations_count + 1
        return self.value

    def reset(self):
        self.value = 0
        self.operations_count = 0
        return self.value
