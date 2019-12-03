import path from 'path';
import { readdirSync } from 'fs';
import { CLIEngine } from 'eslint';

const getDirectories = (source) => readdirSync(source, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

export default function eslint(files, eslintConfigPath, githubWorkspace) {
  // eslint-disable-next-line max-len
  // eslint-disable-next-line global-require,import/no-dynamic-require,import/no-extraneous-dependencies
  console.log(path.join(githubWorkspace, eslintConfigPath));
  const cli = new CLIEngine({
    useEslintrc: false,
    configFile: path.join(githubWorkspace, eslintConfigPath),
    extensions: ['.js', '.jsx', '.tsx']
  });
  // console.log(process.cwd(), GITHUB_WORKSPACE);
  console.log(files);
  const report = cli.executeOnFiles(files);
  // fixableErrorCount, fixableWarningCount are available too
  const { results, errorCount, warningCount } = report;

  const levels = ['', 'warning', 'failure'];

  const annotations = [];
  console.log({ githubWorkspace });

  // eslint-disable-next-line no-restricted-syntax
  for (const result of results) {
    const { filePath, messages } = result;
    console.log(cli.getConfigForFile(filePath));
    const path = filePath.substring(githubWorkspace.length + 1);
    // eslint-disable-next-line no-restricted-syntax
    for (const msg of messages) {
      const {
        line, severity,
        ruleId, message
      } = msg;
      console.log(msg);
      const annotationLevel = levels[severity];
      if (!cli.isPathIgnored(filePath)) {
        annotations.push({
          path,
          start_line: line,
          end_line: line,
          annotation_level: annotationLevel,
          message: `[${ruleId}] ${message}`
        });
      }
    }
  }
  console.log(annotations);
  return {
    conclusion: errorCount > 0 ? 'failure' : 'success',
    output: {
      // title: checkName,
      title: 'testic',
      summary: `${errorCount} error(s), ${warningCount} warning(s) found`,
      annotations
    }
  };
}
