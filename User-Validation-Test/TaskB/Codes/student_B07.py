# Student B07 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a Bicycle subclass

class Vehicle:
    def __init__(self, brand):
        self.brand = brand
        self.distance = 0

    def display(self):
        print("Vehicle:", self.brand)


class Bicycle(Vehicle):
    def __init__(self, brand):
        super().__init__(brand)
        self.gears = 21
        self.current_gear = 1

    def shift_up(self):
        self.current_gear = self.current_gear + 1

    def shift_down(self):
        self.current_gear = self.current_gear - 1

    def ride(self, km):
        self.distance = self.distance + km
