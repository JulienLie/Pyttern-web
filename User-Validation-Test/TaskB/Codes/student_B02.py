# Student B02 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a Motorcycle subclass

class Vehicle:
    def __init__(self, brand):
        self.brand = brand
        self.mileage = 0

    def drive(self, km):
        self.mileage = self.mileage + km


class Motorcycle(Vehicle):
    def __init__(self, brand):
        super().__init__(brand)
        self.engine_cc = 600
        self.has_sidecar = False

    def needs_special_license(self, rider_age):
        if rider_age < 18:
            return False
        if self.engine_cc > 500:
            return True
