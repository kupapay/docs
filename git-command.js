const { execSync } = require('child_process');

try {
  const output = execSync('git status', { encoding: 'utf-8' });
  console.log('Git Status Output:');
  console.log(output);
} catch (error) {
  console.error('Error executing git command:', error.message);
  process.exit(1);
}
