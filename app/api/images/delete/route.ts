import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// We use the environment variables provided by the user.
// Note: We strip 'NEXT_PUBLIC_' if we want to be strict, but here we just use what's available.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbngeq01j',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_PUBLIC_API,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const { public_id } = await request.json();

    console.log('--- Cloudinary Delete Request ---');
    console.log('Received public_id:', public_id);
    console.log(
      'Cloud Name configured:',
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbngeq01j'
    );
    // Do not log the full secret, just check if it exists
    console.log('API Secret present:', !!process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET);

    if (!public_id) {
      return NextResponse.json({ error: 'Missing public_id' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(public_id);
    console.log('Cloudinary Destroy Result:', result);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Cloudinary Deletion Error:', error);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
