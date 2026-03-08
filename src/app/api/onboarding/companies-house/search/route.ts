import { NextResponse } from 'next/server';

const COMPANIES_HOUSE_API_KEY = 'd01add1f-f58d-45d6-aaa2-52846af82f09';
const BASE_URL = 'https://api.company-information.service.gov.uk';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BASE_URL}/search/companies?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Basic ${btoa(COMPANIES_HOUSE_API_KEY + ':')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Companies House API Error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch from Companies House' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Companies House API Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
