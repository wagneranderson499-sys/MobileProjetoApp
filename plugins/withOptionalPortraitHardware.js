const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withOptionalPortraitHardware(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const features = manifest['uses-feature'] || [];
    const name = 'android.hardware.screen.portrait';

    const existing = features.find((feature) => feature.$?.['android:name'] === name);
    if (existing) {
      existing.$['android:required'] = 'false';
    } else {
      features.push({
        $: {
          'android:name': name,
          'android:required': 'false',
        },
      });
    }

    manifest['uses-feature'] = features;
    return config;
  });
};
