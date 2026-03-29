# Student B06 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a subclass

class Car:
    def __init__(self, brand):
        self.brand = brand
        self.speed = 0
        self.fuel = 100

    def accelerate(self):
        self.speed = self.speed + 10
        self.fuel = self.fuel - 5
        return self.speed

    def brake(self):
        if self.speed > 0:
            return self.speed - 10
        return 0

    def refuel(self, amount):
        self.fuel = self.fuel + amount
        return self.fuel
