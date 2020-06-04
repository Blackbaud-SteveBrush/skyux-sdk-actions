function adjustSkyuxConfig() {
  const fs = require('fs-extra');
  const path = require('path');

  const filePath = path.resolve(__dirname, '../skyux-sdk-template/skyuxconfig.json');
  const json = fs.readJsonSync(filePath);

  json.testSettings = {
    e2e: {
      browserSet: 'speedy'
    },
    unit: {
      browserSet: 'paranoid'
    }
  };

  fs.writeJsonSync(filePath, json);
}

adjustSkyuxConfig();