# Student B11 - Vehicle hierarchy
# Assignment: Implement a Vehicle base class and a Jeep subclass

class Vehicle:
    def __init__(self, brand)
        self.brand = brand
        self.terrain = "road"

    def get_brand(self):
        return self.brand


class Jeep(Vehicle):
    def __init__(self, brand):
        super().__init__(brand)
        self.four_wd = True

    def off_road(self)
        self.terrain = "off-road"
        return True
