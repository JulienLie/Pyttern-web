# Student B05 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a Bus subclass

class Vehicle:
    def __init__(self, brand):
        self.brand = brand
        self.year = 2024

    def get_age(self):
        return 2025 - self.year


class Bus(Vehicle):
    def __init__(self, brand):
        self.brand = brand
        self.capacity = 50
        self.passengers = 0

    def board_passenger(self):
        self.passengers = self.passengers + 1
        return self.passengers

    def get_available_seats(self):
        return self.capacity - self.passengers
