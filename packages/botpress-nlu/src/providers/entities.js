export default {
  // Date & Time
  '@native.date': { '@luis': 'datetimeV2', '@dialogflow': 'date' },
  '@native.time': { '@luis': 'datetimeV2', '@dialogflow': 'time' },
  '@native.date-time': { '@luis': 'datetimeV2', '@dialogflow': 'date-time' },
  '@native.date-period': { '@luis': 'datetimeV2', '@dialogflow': 'date-period' },
  '@native.time-period': { '@luis': 'datetimeV2', '@dialogflow': 'time-period' },

  // Numbers
  '@native.number': { '@dialogflow': 'number', '@luis': 'number' },
  '@native.cardinal': { '@dialogflow': 'cardinal' },
  '@native.ordinal': { '@luis': 'ordinal', '@dialogflow': 'ordinal' },
  '@native.number-integer': { '@dialogflow': 'number-integer' },
  '@native.number-sequence': { '@dialogflow': 'number-sequence' },
  '@native.flight-number': { '@dialogflow': 'flight-number' },

  // Amounts with Units
  '@native.unit-area': { '@luis': 'dimension', '@dialogflow': 'unit-area' },
  '@native.unit-currency': { '@luis': 'money', '@dialogflow': 'unit-currency' },
  '@native.unit-length': { '@luis': 'dimension', '@dialogflow': 'unit-lenght' },
  '@native.unit-speed': { '@dialogflow': 'unit-speed' },
  '@native.unit-volume': { '@dialogflow': 'unit-volume' },
  '@native.unit-weight': { '@dialogflow': 'unit-weight' },
  '@native.unit-information': { '@dialogflow': 'unit-information' },
  '@native.percentage': { '@luis': 'percentage', '@dialogflow': 'percentage' },
  '@native.temperature': { '@luis': 'temperature', '@dialogflow': 'temperature' },
  '@native.duration': { '@dialogflow': 'duration' },
  '@native.age': { '@dialogflow': 'age' },

  // Unit Names
  '@native.currency-name': { '@dialogflow': 'currency-name' },
  '@native.unit-area-name': { '@dialogflow': 'unit-area-name' },
  '@native.unit-length-name': { '@dialogflow': 'unit-lenght-name' },
  '@native.unit-speed-name': { '@dialogflow': 'unit-speed-name' },
  '@native.unit-volume-name': { '@dialogflow': 'unit-volume-name' },
  '@native.unit-weight-name': { '@dialogflow': 'unit-weight-name' },
  '@native.unit-information-name': { '@dialogflow': 'unit-information-name' },

  // Geography
  '@native.address': { '@dialogflow': 'address' },
  '@native.street-address': { '@dialogflow': 'street-address' },
  '@native.zip-code': { '@dialogflow': 'zip-code' },
  '@native.geo-capital': { '@dialogflow': 'geo-capital' },
  '@native.geo-country': { '@dialogflow': 'geo-country' },
  '@native.geo-country-code': { '@dialogflow': 'geo-country-code' },
  '@native.geo-city': { '@dialogflow': 'geo-city' },
  '@native.geo-city-us': { '@dialogflow': 'geo-city-us' },
  '@native.geo-state-us': { '@dialogflow': 'geo-state-us' },
  '@native.geo-city-gb': { '@dialogflow': 'geo-city-gb' },
  '@native.place-attraction-us': { '@dialogflow': 'place-attraction-us' },
  '@native.place-attraction-gb': { '@dialogflow': 'place-attraction-gb' },
  '@native.airport': { '@dialogflow': 'airport' },
  '@native.location': { '@dialogflow': 'location' },

  // Contacts
  '@native.email': { '@luis': 'email', '@dialogflow': 'email' },
  '@native.phone-number': { '@luis': 'phonenumber', '@dialogflow': 'phone-number' },

  // Names
  '@native.given-name': { '@dialogflow': 'given-name' },
  '@native.last-name': { '@dialogflow': 'last-name' },

  // Music
  '@native.music-artist': { '@dialogflow': 'music-artist' },
  '@native.music-genre': { '@dialogflow': 'music-genre' },

  // Others
  '@native.color': { '@dialogflow': 'color' },
  '@native.language': { '@dialogflow': 'language' },

  // Generic
  '@native.any': { '@dialogflow': 'any' },
  '@native.url': { '@luis': 'url', '@dialogflow': 'url' }
}
