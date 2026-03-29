# Student A2 - Calculator class
# Assignment: Implement a Calculator class with basic operations

class Calculator:
    def __init__(self, initial_value):
        self.value = initial_value
        return self

    def add(self, number):
        self.value = self.value + number
        return self.value

    def subtract(self, number):
        self.value = self.value - number
        return self.value
