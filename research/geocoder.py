#!/usr/bin/env python

# A very basic geocoder to get addresses from locations.json

from geopy import geocoders
import json
import time

OUTPUT_FILE_NAME = 'output.json'

geocoder = geocoders.Google()
locations = json.load(open('locations.json', 'r'))

prior_locations = json.load(open(OUTPUT_FILE_NAME, 'r'))
output = {}
errors = {}

for l in locations:
    addr = l['address']
    # already looked for it
    if not addr:
        print("No address")
        continue
    elif addr in prior_locations:
        result = prior_locations[addr]
        print("already found %s: %s" % (addr, result))
        output[addr] = result
    else:
        try:
            result = geocoder.geocode(addr)
            print("%s: %s" % (addr, result))
            output[addr] = result
        except Exception as e:
            print("%s: %s" % (addr, e))
            errors[addr] = str(e)
        time.sleep(2)

json.dump(output, open(OUTPUT_FILE_NAME, 'w'), indent=4)
json.dump(errors, open('errors.json', 'w'), indent=4)
