import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const patternsDir = path.join(process.cwd(), 'src', 'fabric-patterns');
    const entries = await fs.readdir(patternsDir, { withFileTypes: true });
    const patterns = entries
      .filter(entry => entry.isDirectory())
      .map(dir => dir.name);
    
    return Response.json({ patterns });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return Response.json({ error: 'Failed to fetch patterns' }, { status: 500 });
  }
}
