# Student B09 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a subclass

class Garage:
    def __init__(self, name):
        self.name = name
        self.vehicles = []
        self.capacity = 10

    def add_vehicle(self, vehicle):
        self.vehicles.append(vehicle)

    def remove_vehicle(self, vehicle):
        self.vehicles.remove(vehicle)

    def show_all(self):
        for v in self.vehicles:
            print(v)

    def is_full(self):
        print("Checking capacity...")
        print("Current:", len(self.vehicles))
