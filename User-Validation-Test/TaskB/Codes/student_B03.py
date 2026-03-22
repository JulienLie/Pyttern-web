# Student B03 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a Truck subclass

class Vehicle:
    def __init__(self, brand):
        self.brand = brand
        self.fuel = 100

    def get_fuel_level(self):
        return self.fuel


class Truck(Vehicle):
    def __init__(self, brand):
        super().__init__(brand)
        self.payload = 0
        self.max_payload = 10000

    def load_cargo(self, weight):
        if weight > self.max_payload:
            return False
        self.payload = self.payload + weight
        return True

    def get_status(self):
        return self.brand + " carrying " + str(self.payload) + " kg"
