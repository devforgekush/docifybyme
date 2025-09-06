import { NextResponse } from 'next/server'

// Minimal revoke endpoint: responds with success. Replace with full revocation
// logic (using server-side GitHub app credentials) when ready.
export async function POST() {
	return NextResponse.json({ success: true })
}
