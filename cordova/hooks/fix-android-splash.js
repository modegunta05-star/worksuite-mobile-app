const fs = require('fs');
const path = require('path');

module.exports = function (context) {
  const root = context.opts.projectRoot;
  const themesPath = path.join(root, 'platforms/android/app/src/main/res/values/themes.xml');
  const iconPath = path.join(root, 'platforms/android/app/src/main/res/drawable-nodpi/ic_cdv_splashscreen.png');
  const sourceIconPath = path.join(root, 'res/screen/android/cordova-splash-icon.png');

  if (fs.existsSync(themesPath)) {
    const theme = fs
      .readFileSync(themesPath, 'utf8')
      .replace('parent="Theme.SplashScreen.IconBackground"', 'parent="Theme.SplashScreen"')
      .replace(/\s*<item name="windowSplashScreenIconBackgroundColor">[\s\S]*?<\/item>/g, '');
    fs.writeFileSync(themesPath, theme);
  }

  if (fs.existsSync(sourceIconPath)) {
    fs.mkdirSync(path.dirname(iconPath), { recursive: true });
    fs.copyFileSync(sourceIconPath, iconPath);
  }
};
