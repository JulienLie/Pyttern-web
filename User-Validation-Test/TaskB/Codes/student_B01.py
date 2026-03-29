# Student B01 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a Car subclass

class Vehicle:
    def __init__(self, brand):
        self.brand = brand
        self.speed = 0
        self.is_running = False

    def start(self):
        self.is_running = True
        return self.is_running

    def get_info(self):
        return self.brand + " (speed: " + str(self.speed) + ")"


class Car(Vehicle):
    def __init__(self, brand):
        super().__init__(brand)
        self.doors = 4
        self.passengers = []

    def add_passenger(self, name):
        self.passengers.append(name)
        return len(self.passengers)

    def describe(self):
        return self.brand + " car with " + str(self.doors) + " doors"
