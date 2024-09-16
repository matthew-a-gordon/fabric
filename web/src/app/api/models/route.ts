import { models } from '@/config/models';

export async function GET() {
  try {
    return Response.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return Response.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}

