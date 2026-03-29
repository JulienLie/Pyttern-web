# Student B10 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a Van subclass

class Vehicle:
    def __init__(self, brand):
        self.brand = brand
        self.odometer = 0
        self.is_running = False

    def start_engine(self):
        self.is_running = True
        return self.is_running

    def stop_engine(self):
        self.is_running = False
        return self.is_running


class Van(Vehicle):
    def __init__(self, brand):
        super().__init__(brand)
        self.cargo = []
        self.max_weight = 2000

    def load_item(self, item):
        self.cargo.append(item)
        return len(self.cargo)

    def unload_all(self):
        items = self.cargo
        self.cargo = []
        return items

    def get_summary(self):
        return self.brand + " van with " + str(len(self.cargo)) + " items"
