#!/usr/bin/env python

# A very basic geocoder to get addresses from locations.json

from geopy import geocoders
import json
import time

geocoder = geocoders.Google()
locations = json.load(open('locations.json', 'r'))
output = {}
errors = {}

for l in locations:
    addr = l['address']
    try:
        result = geocoder.geocode(addr)
        print("%s: %s" % (addr, result))
        output[addr] = result
    except Exception as e:
        print("%s: %s" % (addr, e))
        errors[addr] = str(e)
    time.sleep(2)

json.dump(output, open('output.json', 'w'), indent=4)
json.dump(errors, open('errors.json', 'w'), indent=4)
