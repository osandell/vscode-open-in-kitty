const vscode = require("vscode");
const { exec } = require("child_process");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.openInKitty",
    function () {
      // Get the path of the first workspace folder
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        const projectRootPath = workspaceFolders[0].uri.fsPath;

        const script = `
          current_dir="${projectRootPath}"
          if [ -z "$current_dir" ]; then
              echo "No directory provided. Usage: $0 <path>"
              exit 1
          fi

          pid=$(ps aux | grep '/Applications/kitty.app/Contents/MacOS/kitty' | grep -v grep | awk '{print $2}')
          socket_path="unix:/tmp/mykitty-$pid"

          # We need to truncate the path so that it matches the path in kitty's tab
          current_dir_short=$(echo $current_dir | sed 's|/Users/olof|~|')
          existing_tab_id=$(kitty @ --to "$socket_path" ls | jq -r --arg title "$current_dir_short" '.[].tabs[] | select(.title==$title) | .id')

          if [ -z "$existing_tab_id" ]; then
              kitty @ --to "$socket_path" launch --type=tab --cwd "$current_dir"
          else
              kitty @ --to "$socket_path" focus-tab --match id:$existing_tab_id
          fi

          ELECTRON_RUN_AS_NODE=1 /Applications/GitKraken.app/Contents/MacOS/GitKraken /Applications/GitKraken.app/Contents/Resources/app.asar/src/main/static/cli.js -p "$current_dir"
          open -a kitty
          sleep 0.3
          open -a kitty
        `;

        exec(
          script,
          // `/Users/olof/dev/osandell/vscode-open-in-kitty/open_tabs_test.sh ${projectRootPath}`,
          (error, stdout, stderr) => {
            // if (error) {
            //   vscode.window.showErrorMessage(`Error: ${error.message}`);
            //   return;
            // }
            // if (stderr) {
            //   vscode.window.showErrorMessage(`Stderr: ${stderr}`);
            //   return;
            // }
            // vscode.window.showInformationMessage(
            //   `Opened in Kitty: ${projectRootPath}`
            // );
          }
        );
      } else {
        vscode.window.showErrorMessage("No workspace folder found.");
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
