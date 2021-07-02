const { TypeScriptProject } = require('projen');

const project = new TypeScriptProject({
  name: 'jsii-docgen',
  description: 'generates api docs for jsii modules',
  repository: 'https://github.com/eladb/jsii-docgen',
  authorName: 'Elad Ben-Israel',
  authorEmail: 'benisrae@amazon.com',
  defaultReleaseBranch: 'master',

  bin: {
    'jsii-docgen': 'bin/jsii-docgen',
  },
  devDeps: [
    '@types/fs-extra@^8', // >8 needs a newer node version
    'glob-promise',
    'glob',
  ],
  deps: [
    'yargs',
    'fs-extra',
    'case',
    'glob',
    'jsii-reflect',
    '@jsii/spec',
    'jsii-rosetta@./vendor/jsii-rosetta.tgz',
    '@jsii/spec@./vendor/jsii-spec.tgz',
  ],
  bundledDeps: [
    'jsii-rosetta',
    '@jsii/spec',
  ],
  compileBeforeTest: true, // we need this for the CLI test
  releaseToNpm: true,
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
});

project.addFields({ resolutions: { '@jsii/spec': './vendor/jsii-spec.tgz' } });

const libraryFixtures = ['construct-library'];

// compile the test fixtures with jsii
for (const library of libraryFixtures) {
  project.compileTask.exec('npm ci', { cwd: `./test/__fixtures__/libraries/${library}` });
  project.compileTask.exec('npm run compile', { cwd: `./test/__fixtures__/libraries/${library}` });
}

// artifacts created by transpilation in tests
project.gitignore.exclude('test/**/.jsii.*');
project.gitignore.include('vendor/jsii-spec.tgz');
project.gitignore.include('vendor/jsii-rosetta.tgz');
project.synth();
