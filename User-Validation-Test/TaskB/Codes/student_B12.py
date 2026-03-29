# Student B12 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a Taxi subclass

class Vehicle:
    def __init__(self, brand):
        self.brand = brand
        self.mileage = 0

    def drive(self, km):
        self.mileage = self.mileage + km


class Taxi(Vehicle):
    def __init__(self, brand):
        super().__init__(brand)
        self.fare = 0
        self.is_available = True
        return None

    def calculate_fare(self, distance):
        if distance <= 0:
            return 0
        self.fare = distance * 2.5

    def pick_up(self, passenger):
        if self.is_available:
            return True
