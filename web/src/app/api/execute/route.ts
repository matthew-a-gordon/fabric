import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const fabricPath = '/home/matt/go/bin/fabric';

export async function POST(request: Request) {
  console.log('Execute API route hit');
  const { input, pattern, model, isYouTubeUrl } = await request.json();

  let command;
  if (isYouTubeUrl) {
    command = `yt ${input} | ${fabricPath} -m ${model} -p ${pattern}`;
  } else {
    command = `echo "${input}" | ${fabricPath} -m ${model} -p ${pattern}`;
  }

  try {
    console.log('Executing command:', command);
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error('Command stderr:', stderr);
    }
    console.log('Command output:', stdout);
    return new Response(stdout);
  } catch (error) {
    console.error('Error executing command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Failed to execute command', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
