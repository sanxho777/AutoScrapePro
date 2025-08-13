/**
 * VIN Validation Utility
 * Validates Vehicle Identification Numbers using check digit algorithm
 */

const TRANSLITERATION_MAP: { [key: string]: number } = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9, 'S': 2,
  'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
};

const WEIGHT_FACTORS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * Validates a VIN using the ISO 3779 standard check digit algorithm
 */
export function validateVin(vin: string): boolean {
  return isValidVIN(vin);
}

/**
 * Validates a VIN using the ISO 3779 standard check digit algorithm
 */
export function isValidVIN(vin: string): boolean {
  if (!vin || typeof vin !== 'string') {
    return false;
  }

  // Remove whitespace and convert to uppercase
  const cleanVIN = vin.trim().toUpperCase();

  // Check length
  if (cleanVIN.length !== 17) {
    return false;
  }

  // Check for invalid characters (I, O, Q are not allowed)
  if (/[IOQ]/.test(cleanVIN)) {
    return false;
  }

  // Check that all characters are alphanumeric
  if (!/^[A-HJ-NPR-Z0-9]+$/.test(cleanVIN)) {
    return false;
  }

  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = cleanVIN[i];
    let value: number;

    if (/\d/.test(char)) {
      value = parseInt(char, 10);
    } else {
      value = TRANSLITERATION_MAP[char];
      if (value === undefined) {
        return false;
      }
    }

    sum += value * WEIGHT_FACTORS[i];
  }

  const checkDigit = sum % 11;
  const expectedCheckDigit = checkDigit === 10 ? 'X' : checkDigit.toString();
  const actualCheckDigit = cleanVIN[8];

  return actualCheckDigit === expectedCheckDigit;
}

/**
 * Extracts information from a VIN
 */
export function parseVIN(vin: string) {
  if (!isValidVIN(vin)) {
    return null;
  }

  const cleanVIN = vin.trim().toUpperCase();

  return {
    wmi: cleanVIN.substring(0, 3),  // World Manufacturer Identifier
    vds: cleanVIN.substring(3, 9),  // Vehicle Descriptor Section
    vis: cleanVIN.substring(9, 17), // Vehicle Identifier Section
    year: getModelYear(cleanVIN[9]),
    checkDigit: cleanVIN[8]
  };
}

/**
 * Converts VIN position 10 character to model year
 */
function getModelYear(char: string): number {
  const yearMap: { [key: string]: number } = {
    'A': 1980, 'B': 1981, 'C': 1982, 'D': 1983, 'E': 1984, 'F': 1985,
    'G': 1986, 'H': 1987, 'J': 1988, 'K': 1989, 'L': 1990, 'M': 1991,
    'N': 1992, 'P': 1993, 'R': 1994, 'S': 1995, 'T': 1996, 'V': 1997,
    'W': 1998, 'X': 1999, 'Y': 2000, '1': 2001, '2': 2002, '3': 2003,
    '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009
  };

  const baseYear = yearMap[char];
  if (!baseYear) return 0;

  // Handle year cycle (repeats every 30 years)
  const currentYear = new Date().getFullYear();
  if (baseYear <= currentYear) {
    return baseYear;
  } else {
    return baseYear - 30;
  }
}