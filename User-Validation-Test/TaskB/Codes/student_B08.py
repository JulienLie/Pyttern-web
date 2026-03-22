# Student B08 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a Scooter subclass

class Vehicle:
    def __init__(self, brand):
        self.brand = brand
        self.registered = False

    def get_brand(self):
        return self.brand


class Scooter(Vehicle):
    def __init__(self, brand):
        self.brand = brand
        self.max_speed = 45
        self.battery = 100

    def can_ride(self, age):
        if age >= 16:
            return True
        if age >= 14:
            return False

    def check_battery(self):
        if self.battery < 20:
            return False
        return True
