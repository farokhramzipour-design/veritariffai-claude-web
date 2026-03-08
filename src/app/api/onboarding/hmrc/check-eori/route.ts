import { NextResponse } from 'next/server';

// Mock implementation of HMRC EORI Check
// Real API would require OAuth/Application credentials and call:
// https://api.service.hmrc.gov.uk/customs/eori/lookup/check-multiple-eori

export async function POST(request: Request) {
  try {
    const { eoriNumber } = await request.json();

    if (!eoriNumber) {
      return NextResponse.json({ error: 'EORI Number is required' }, { status: 400 });
    }

    // Mock logic:
    // If it starts with GB and is followed by 12 digits (VAT + 000), consider it valid for demo purposes.
    // Or check against specific test cases if needed.
    
    const isValidFormat = /^GB\d{12}$/.test(eoriNumber);
    
    if (isValidFormat) {
      // Simulate success response structure from HMRC
      return NextResponse.json({
        eori: eoriNumber,
        valid: true,
        companyName: "Mock Company Ltd", // Ideally this would come from the real API
        address: "123 Mock St, London, UK"
      });
    } else {
      return NextResponse.json({
        eori: eoriNumber,
        valid: false,
        error: "Invalid EORI format or not found"
      });
    }

  } catch (error) {
    console.error('HMRC API Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
