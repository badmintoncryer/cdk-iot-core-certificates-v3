import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Kazuho CryerShinozuka',
  authorAddress: 'malaysia.cryer@gmail.com',
  cdkVersion: '2.150.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.8.0',
  name: 'cdk-iot-core-certificates-v3',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/badmintoncryer/cdk-iot-core-certificates-v3.git',
  keywords: ['aws', 'cdk', 'iot', 'aws-cdk'],
  gitignore: ['*.js', '*.d.ts', '!test/.*.snapshot/**/*', '.tmp'],
  deps: ['@aws-sdk/client-iot'],
  description: 'CDK Construct for AWS IoT Core certificates and things',
  devDeps: [
    '@aws-cdk/integ-runner@2.150.0-alpha.0',
    '@aws-cdk/integ-tests-alpha@2.150.0-alpha.0',
  ],
  releaseToNpm: true,
  packageName: 'cdk-iot-core-certificates-v3',
  publishToPypi: {
    distName: 'cdk-iot-core-certificates-v3',
    module: 'cdk_iot_core_certificates_v3',
  },
  bundledDeps: ['@aws-sdk/client-iot', '@smithy/smithy-client', 'aws-lambda', '@types/aws-lambda'],
});
project.projectBuild.compileTask.prependExec('npm ci && npm run build', {
  cwd: 'lambda',
});
project.projectBuild.testTask.exec(
  'yarn tsc -p tsconfig.dev.json && yarn integ-runner',
);
project.addTask('convert-hardlink', {
  exec: 'find . -type f -links +1 -exec cp -f {} {}.tmp \\; -exec mv {}.tmp {} \\;',
});
const publishTask = project.tasks.tryFind('release:npm');
const task = project.tasks.tryFind('convert-hardlinks');
if (publishTask && task) {
  publishTask.prependSpawn(task);
}
project.synth();
