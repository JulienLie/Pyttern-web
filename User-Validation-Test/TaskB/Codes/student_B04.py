# Student B04 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a SportsCar subclass

class Vehicle:
    def __init__(self, brand):
        self.brand = brand
        self.speed = 0

    def accelerate(self):
        self.speed = self.speed + 10
        return self.speed


class SportsCar(Vehicle):
    def __init__(self, brand):
        super().__init__(brand)
        self.turbo = False
        return self

    def activate_turbo(self):
        self.turbo = True
        return self.turbo

    def get_top_speed(self):
        return 250
