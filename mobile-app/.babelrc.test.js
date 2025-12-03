module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/features': './src/features',
            '@/api': './src/api',
            '@/store': './src/store',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            '@/theme': './src/theme',
            '@/types': './src/types',
            '@/config': './src/config',
            '@/navigation': './src/navigation',
            '@/contexts': './src/contexts',
            '@/providers': './src/providers',
          },
        },
      ],
      // Omit react-native-reanimated/plugin for tests
    ],
  };
};
