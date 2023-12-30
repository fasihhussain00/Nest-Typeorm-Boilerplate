import { BadRequestException, Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { env } from 'src/env';

@Injectable()
export class ScopeDetectionService {
  public async findScopeDuration(uri: string): Promise<number> {
    try {
      const output = await this.runScopeDetectionService(uri);
      if (!/d+/.test(output)) {
        return parseFloat(output);
      }
      throw new BadRequestException({ message: 'some error occurred' });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
  private runScopeDetectionService(uri: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = env.SCOPE_DETECTION_PYTHON;
      const args = [
        '-m',
        'poetry',
        'run',
        'python',
        'main.py',
        `--input=${uri}`,
      ];
      const pythonScript = spawn(command, args, {
        cwd: './scope-detection',
      });
      let output = '';
      pythonScript.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonScript.stderr.on('data', (data) => {
        reject(data.toString());
      });

      pythonScript.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(`Python script exited with code ${code}`);
        }
      });
    });
  }
}
