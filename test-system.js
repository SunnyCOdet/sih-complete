// Simple test script to verify the system works
const { demonstrateVotingSystem } = require('./dist/examples/usage');

console.log('🧪 Testing Secure Voting System...\n');

demonstrateVotingSystem()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
