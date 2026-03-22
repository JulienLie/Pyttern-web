# Student A3 - Calculator class
# Assignment: Implement a Calculator class with basic operations

class Calculator:
    def __init__(self, initial_value):
        self.value = initial_value

    def add(self, number):
        self.value = self.value + number
        print("Result:", self.value)

    def subtract(self, number):
        self.value = self.value - number
        print("Result:", self.value)

    def show(self):
        print("Current value:", self.value)
