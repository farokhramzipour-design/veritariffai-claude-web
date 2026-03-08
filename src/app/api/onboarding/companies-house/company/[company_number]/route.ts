import { NextResponse } from 'next/server';

const COMPANIES_HOUSE_API_KEY = 'd01add1f-f58d-45d6-aaa2-52846af82f09';
const BASE_URL = 'https://api.company-information.service.gov.uk';

export async function GET(request: Request, { params }: { params: { company_number: string } }) {
  const { company_number } = params;

  if (!company_number) {
    return NextResponse.json({ error: 'Company number is required' }, { status: 400 });
  }

  try {
    // Fetch basic company profile
    const profileResponse = await fetch(`${BASE_URL}/company/${company_number}`, {
      headers: {
        Authorization: `Basic ${btoa(COMPANIES_HOUSE_API_KEY + ':')}`,
      },
    });

    if (!profileResponse.ok) {
        if (profileResponse.status === 404) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }
      const errorText = await profileResponse.text();
      console.error('Companies House API Error (Profile):', profileResponse.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: profileResponse.status });
    }

    const profileData = await profileResponse.json();

    // Ideally, we would fetch other resources concurrently if needed for the snapshot
    // e.g. officers, filing-history, etc.
    // But for the initial "Active" check, just the profile is enough.
    
    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Companies House API Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
