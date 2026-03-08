import { NextResponse } from 'next/server';

const VIES_API_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number';

export async function POST(request: Request) {
  try {
    const { countryCode, vatNumber } = await request.json();

    if (!countryCode || !vatNumber) {
      return NextResponse.json({ error: 'Country Code and VAT Number are required' }, { status: 400 });
    }

    // Call VIES REST API
    const response = await fetch(VIES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryCode,
        vatNumber,
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('VIES API Error:', response.status, errorText);
        return NextResponse.json({ 
            valid: false, 
            error: 'Failed to validate VAT number via VIES',
            details: errorText
        }, { status: response.status });
    }

    const data = await response.json();
    // VIES REST API returns { valid: boolean, requestDate: string, userError: string, name: string, address: string, ... }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('VIES API Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
